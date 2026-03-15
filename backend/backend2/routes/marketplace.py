# backend/routes/marketplace.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import uuid4, UUID
from datetime import datetime
import logging

from utils.session import get_current_session
from config.settings import supabase

logger = logging.getLogger(__name__)

router = APIRouter()

# ------------------------------------------------------------------
# Pydantic Models
# ------------------------------------------------------------------
class Product(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None

class OrderItem(BaseModel):
    id: str
    name: str
    quantity: float
    price: float
    seller_id: Optional[str] = None

class Order(BaseModel):
    products: List[OrderItem]
    total: float
    delivery: Dict[str, Any]
    delivery_method: str
    payment_method: str
    pickup_time: Optional[datetime] = None
    tracking_link: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str

# ------------------------------------------------------------------
# Startup: List Buckets
# ------------------------------------------------------------------
@router.on_event("startup")
async def startup_event():
    try:
        buckets = supabase.storage.list_buckets()
        logger.info(f"Available storage buckets: {[b['id'] for b in buckets]}")
    except Exception as e:
        logger.error(f"Failed to list Supabase buckets: {str(e)}")

# ------------------------------------------------------------------
# POST /products
# ------------------------------------------------------------------
@router.post("/products", response_model=Product)
async def add_product(product: Product, session: dict = Depends(get_current_session)):
    try:
        if product.quantity <= 0 or product.price <= 0:
            raise HTTPException(status_code=400, detail="Quantity and price must be positive")
        if len(product.name) > 100:
            raise HTTPException(status_code=400, detail="Name must be under 100 characters")
        if product.description and len(product.description) > 500:
            raise HTTPException(status_code=400, detail="Description must be under 500 characters")

        valid_categories = ["Seeds", "Fertilizers", "Pesticides", "Tools"]
        valid_units = ["kg", "g", "L", "pcs"]
        if product.category not in valid_categories:
            raise HTTPException(status_code=400, detail="Invalid category")
        if product.unit not in valid_units:
            raise HTTPException(status_code=400, detail="Invalid unit")

        product_data = {
            "id": str(uuid4()),
            "name": product.name,
            "category": product.category,
            "quantity": product.quantity,
            "unit": product.unit,
            "price": product.price,
            "description": product.description,
            "image": product.image or "/lovable-Uploads/dfae19bc-0068-4451-9902-2b41432ac120.png",
            "seller_id": session["user_id"],
            "created_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("products").insert(product_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to add product")

        logger.info(f"Product added by {session['email']}: {product_data['name']}")
        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding product for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding product: {str(e)}")

# ------------------------------------------------------------------
# POST /products/upload-image
# ------------------------------------------------------------------
@router.post("/products/upload-image")
async def upload_product_image(file: UploadFile = File(...), session: dict = Depends(get_current_session)):
    try:
        ext = file.filename.split(".")[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png']:
            raise HTTPException(status_code=400, detail="Only JPG, JPEG, PNG allowed")

        path = f"products/{session['user_id']}/{uuid4()}.{ext}"
        content = await file.read()

        # ────────────────────────────────────────────────
        # Modern supabase-py v2.x upload handling
        # ────────────────────────────────────────────────
        upload_response = supabase.storage.from_("product-images").upload(
            path=path,
            file=content,
            file_options={"content-type": file.content_type}
        )

        # Check for error attribute safely
        if hasattr(upload_response, "error") and upload_response.error is not None:
            error_msg = upload_response.error.message if hasattr(upload_response.error, "message") else str(upload_response.error)
            logger.error(f"Supabase storage upload failed: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {error_msg}")

        # If no error, get public URL
        public_url = supabase.storage.from_("product-images").get_public_url(path)

        logger.info(f"Image uploaded by {session['email']}: {public_url}")
        return {"image_url": public_url}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image upload error for {session.get('email', 'unknown')}: {str(e)}", exc_info=True)
        if "Bucket not found" in str(e):
            raise HTTPException(status_code=404, detail="Bucket 'product-images' not found. Please create it in Supabase.")
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

# ------------------------------------------------------------------
# GET /products
# ------------------------------------------------------------------
@router.get("/products")
async def get_products(
    seller_id: Optional[str] = None,
    q: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    session: dict = Depends(get_current_session)
):
    try:
        query = supabase.table("products").select("*")
        if seller_id:
            query = query.eq("seller_id", seller_id)
        if q:
            query = query.ilike("name", f"%{q}%")
        if category and category in ["Seeds", "Fertilizers", "Pesticides", "Tools"]:
            query = query.eq("category", category)
        query = query.range(offset, offset + limit - 1)
        response = query.execute()

        logger.info(f"Fetched {len(response.data)} products (q={q}, cat={category})")
        return response.data

    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch products")

# ------------------------------------------------------------------
# GET /products/{product_id}
# ------------------------------------------------------------------
@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, session: dict = Depends(get_current_session)):
    try:
        UUID(product_id)
        response = supabase.table("products").select("*").eq("id", product_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found")
        return response.data
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Server error")

# ------------------------------------------------------------------
# PUT /products/{product_id}
# ------------------------------------------------------------------
@router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: Product, session: dict = Depends(get_current_session)):
    try:
        UUID(product_id)
        if product.quantity <= 0 or product.price <= 0:
            raise HTTPException(status_code=400, detail="Quantity and price must be positive")

        existing = supabase.table("products").select("*").eq("id", product_id).eq("seller_id", session["user_id"]).single().execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Product not found or not yours")

        update_data = {
            "name": product.name,
            "category": product.category,
            "quantity": product.quantity,
            "unit": product.unit,
            "price": product.price,
            "description": product.description,
            "image": product.image or existing.data["image"],
            "updated_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("products").update(update_data).eq("id", product_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Update failed")

        logger.info(f"Product {product_id} updated by {session['email']}")
        return response.data[0]

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Update failed")

# ------------------------------------------------------------------
# DELETE /products/{product_id}
# ------------------------------------------------------------------
@router.delete("/products/{product_id}")
async def delete_product(product_id: str, session: dict = Depends(get_current_session)):
    try:
        UUID(product_id)
        existing = supabase.table("products").select("*").eq("id", product_id).eq("seller_id", session["user_id"]).single().execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Product not found or not yours")

        supabase.table("products").delete().eq("id", product_id).execute()
        logger.info(f"Product {product_id} deleted by {session['email']}")
        return {"message": "Product deleted"}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail="Delete failed")

# ------------------------------------------------------------------
# POST /orders
# ------------------------------------------------------------------
# ------------------------------------------------------------------
# POST /orders
# ------------------------------------------------------------------
@router.post("/orders")
async def create_order(order: Order, session: dict = Depends(get_current_session)):
    try:
        # Validate delivery
        required = ["full_name", "phone_number", "address", "city", "state", "pin_code"]
        for f in required:
            if f not in order.delivery or not order.delivery[f]:
                raise HTTPException(status_code=400, detail=f"Missing delivery field: {f}")

        if order.delivery_method not in ["self_pickup", "parcel"]:
            raise HTTPException(status_code=400, detail="Invalid delivery method")
        if order.payment_method not in ["pay_on_delivery", "upi"]:
            raise HTTPException(status_code=400, detail="Invalid payment method")

        # Extract product IDs from Pydantic models
        product_ids = [item.id for item in order.products]
        if not product_ids:
            raise HTTPException(status_code=400, detail="No products in order")

        # Fetch DB products
        db_products = supabase.table("products").select(
            "id,name,quantity,price,seller_id"
        ).in_("id", product_ids).execute()

        if not db_products.data:
            raise HTTPException(status_code=404, detail="No products found")

        db_map = {p["id"]: p for p in db_products.data}

        # Validate each item
        order_items = []
        for item in order.products:
            if item.id not in db_map:
                raise HTTPException(status_code=404, detail=f"Product {item.id} not found")

            p = db_map[item.id]

            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail=f"Invalid quantity for {item.name}")
            if item.quantity > p["quantity"]:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {p['name']}")
            if abs(item.price - p["price"]) > 0.01:
                raise HTTPException(status_code=400, detail=f"Price mismatch for {p['name']}")

            # Update stock
            new_qty = p["quantity"] - item.quantity
            supabase.table("products").update({"quantity": new_qty}).eq("id", item.id).execute()

            # Build order item
            order_items.append({
                "id": item.id,
                "name": item.name,
                "quantity": item.quantity,
                "price": item.price,
                "seller_id": p["seller_id"]
            })

        # Validate total
        items_total = sum(i["price"] * i["quantity"] for i in order_items)
        delivery_fee = 40 if order.delivery_method == "parcel" else 0
        expected_total = items_total + delivery_fee
        if abs(order.total - expected_total) > 0.01:
            raise HTTPException(status_code=400, detail=f"Total mismatch. Expected: {expected_total}")

        # Create order
        order_data = {
            "id": str(uuid4()),
            "buyer_id": session["user_id"],
            "products": order_items,
            "total_price": order.total,
            "delivery": order.delivery,
            "status": "Pending",
            "delivery_method": order.delivery_method,
            "payment_method": order.payment_method,
            "pickup_time": order.pickup_time.isoformat() if order.pickup_time else None,
            "tracking_link": order.tracking_link,
            "delivery_fee": delivery_fee,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("orders").insert(order_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create order")

        logger.info(f"Order created: {order_data['id']} by {session['email']}")
        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Order creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Order creation failed")
# ------------------------------------------------------------------
# GET /orders/{order_id}
# ------------------------------------------------------------------
@router.get("/orders/{order_id}")
async def get_order(order_id: str, session: dict = Depends(get_current_session)):
    try:
        UUID(order_id)
        res = supabase.table("orders").select("*").eq("id", order_id).eq("buyer_id", session["user_id"]).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return res.data
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get order error: {str(e)}")
        raise HTTPException(status_code=500, detail="Server error")

# ------------------------------------------------------------------
# GET /orders
# ------------------------------------------------------------------
@router.get("/orders")
async def get_user_orders(session: dict = Depends(get_current_session)):
    try:
        res = supabase.table("orders").select("*").eq("buyer_id", session["user_id"]).execute()
        return res.data
    except Exception as e:
        logger.error(f"Get orders error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch orders")

# ------------------------------------------------------------------
# GET /seller/orders
# ------------------------------------------------------------------
@router.get("/seller/orders")
async def get_seller_orders(session: dict = Depends(get_current_session)):
    try:
        orders = supabase.table("orders").select("*").execute().data
        seller_orders = []
        for o in orders:
            seller_items = [p for p in o["products"] if p.get("seller_id") == session["user_id"]]
            if seller_items:
                copy = o.copy()
                copy["products"] = seller_items
                seller_orders.append(copy)
        return seller_orders
    except Exception as e:
        logger.error(f"Seller orders error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch seller orders")

# ------------------------------------------------------------------
# PUT /orders/{order_id}/status
# ------------------------------------------------------------------
@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, update: OrderStatusUpdate, session: dict = Depends(get_current_session)):
    try:
        UUID(order_id)
        order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found")

        is_buyer = order.data["buyer_id"] == session["user_id"]
        is_seller = any(p.get("seller_id") == session["user_id"] for p in order.data["products"])
        if not (is_buyer or is_seller):
            raise HTTPException(status_code=403, detail="No permission")

        valid_statuses = {
            "self_pickup": ["Pending", "Ready for Pickup", "Delivered", "Cancelled"],
            "parcel": ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"]
        }
        if update.status not in valid_statuses[order.data["delivery_method"]]:
            raise HTTPException(status_code=400, detail="Invalid status")

        # Buyer cancel
        if is_buyer and update.status == "Cancelled":
            if order.data["status"] not in ["Pending"]:
                raise HTTPException(status_code=403, detail="Cannot cancel")
            for item in order.data["products"]:
                p = supabase.table("products").select("quantity").eq("id", item["id"]).single().execute()
                if p.data:
                    supabase.table("products").update({"quantity": p.data["quantity"] + item["quantity"]}).eq("id", item["id"]).execute()

        # Seller transitions
        transitions = {
            "self_pickup": {"Pending": ["Ready for Pickup"], "Ready for Pickup": ["Delivered"]},
            "parcel": {"Pending": ["Packed"], "Packed": ["Shipped"], "Shipped": ["Delivered"]}
        }
        if is_seller and order.data["status"] in transitions[order.data["delivery_method"]]:
            if update.status not in transitions[order.data["delivery_method"]][order.data["status"]]:
                raise HTTPException(status_code=400, detail="Invalid transition")

        supabase.table("orders").update({
            "status": update.status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", order_id).execute()

        logger.info(f"Order {order_id} → {update.status} by {session['email']}")
        return {"message": "Status updated"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Update failed")

# ------------------------------------------------------------------
# PUT /orders/{order_id}/details
# ------------------------------------------------------------------
@router.put("/orders/{order_id}/details")
async def update_order_details(order_id: str, details: Dict[str, Any], session: dict = Depends(get_current_session)):
    try:
        UUID(order_id)
        order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found")

        if not any(p.get("seller_id") == session["user_id"] for p in order.data["products"]):
            raise HTTPException(status_code=403, detail="Not your order")

        update_data = {"updated_at": datetime.utcnow().isoformat()}
        if "pickup_time" in details and order.data["delivery_method"] == "self_pickup":
            try:
                dt = datetime.fromisoformat(details["pickup_time"].replace("Z", "+00:00"))
                update_data["pickup_time"] = dt.isoformat()
            except:
                raise HTTPException(status_code=400, detail="Invalid pickup time")
        if "tracking_link" in details and order.data["delivery_method"] == "parcel":
            if not isinstance(details["tracking_link"], str) or len(details["tracking_link"]) > 500:
                raise HTTPException(status_code=400, detail="Invalid tracking link")
            update_data["tracking_link"] = details["tracking_link"]

        supabase.table("orders").update(update_data).eq("id", order_id).execute()
        return {"message": "Details updated"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Details update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Update failed")