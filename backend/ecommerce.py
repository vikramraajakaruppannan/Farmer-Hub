from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from utils import supabase, get_session, logger

app = FastAPI()

class Product(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    price: float
    description: str | None = None
    image: str | None = None

class OrderItem(BaseModel):
    id: str
    name: str
    quantity: float
    price: float
    seller_id: str | None = None

class Order(BaseModel):
    products: List[OrderItem]
    total: float
    delivery: dict
    delivery_method: str
    payment_method: str
    pickup_time: Optional[datetime] = None
    tracking_link: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str

@app.post("/products", response_model=Product)
async def add_product(product: Product, session: dict = Depends(get_session)):
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
            "id": str(uuid.uuid4()),
            "name": product.name,
            "category": product.category,
            "quantity": product.quantity,
            "unit": product.unit,
            "price": product.price,
            "description": product.description,
            "image": product.image or "/lovable-Uploads/dfae19bc-0068-4451-9902-2b41432ac120.png",
            "seller_id": session["user_id"],
            "created_at": "now()"
        }
        response = supabase.table("products").insert(product_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to add product")
        logger.info(f"Product added by {session['email']}: {product_data['name']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding product for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding product: {str(e)}")

@app.post("/products/upload-image")
async def upload_product_image(file: UploadFile = File(...), session: dict = Depends(get_session)):
    try:
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ['jpg', 'jpeg', 'png']:
            logger.error(f"Unsupported file extension: {file_extension} by {session['email']}")
            raise HTTPException(status_code=400, detail="Unsupported image format")
        file_path = f"products/{session['user_id']}/{uuid.uuid4()}.{file_extension}"
        file_content = await file.read()
        storage_response = supabase.storage.from_("product-images").upload(file_path, file_content, {"content-type": file.content_type})
        if not storage_response:
            logger.error(f"Storage upload failed for {session['email']}: {file_path}")
            raise HTTPException(status_code=500, detail="Failed to upload image to storage")
        public_url = supabase.storage.from_("product-images").get_public_url(file_path)
        logger.info(f"Product image uploaded by {session['email']}: {public_url}")
        return {"image_url": public_url}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error uploading product image for {session['email']}: {str(e)}")
        if 'Bucket not found' in str(e):
            raise HTTPException(status_code=404, detail="Storage bucket 'product-images' not found")
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

@app.get("/products")
async def get_products(
    seller_id: str | None = None,
    q: str | None = None,
    category: str | None = None,
    limit: int = 10,
    offset: int = 0,
    session: dict = Depends(get_session)
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
        logger.info(f"Fetched {len(response.data)} products for seller_id: {seller_id}, query: {q}, category: {category}, limit: {limit}, offset: {offset}")
        return response.data
    except Exception as e:
        logger.error(f"Error fetching products for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, session: dict = Depends(get_session)):
    try:
        try:
            uuid.UUID(product_id)
        except ValueError:
            logger.error(f"Invalid product_id format: {product_id}")
            raise HTTPException(status_code=400, detail="Invalid product ID format")

        response = supabase.table("products").select("*").eq("id", product_id).single().execute()
        if not response.data:
            logger.error(f"Product not found: {product_id}")
            raise HTTPException(status_code=404, detail="Product not found")
        logger.info(f"Fetched product {product_id} for {session['email']}")
        return response.data
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching product {product_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching product: {str(e)}")

@app.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: Product, session: dict = Depends(get_session)):
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
        try:
            uuid.UUID(product_id)
        except ValueError:
            logger.error(f"Invalid product_id format: {product_id}")
            raise HTTPException(status_code=400, detail="Invalid product ID format")
        existing_product = supabase.table("products").select("*").eq("id", product_id).eq("seller_id", session["user_id"]).single().execute()
        if not existing_product.data:
            raise HTTPException(status_code=404, detail="Product not found or you don't have permission to edit it")
        
        product_data = {
            "name": product.name,
            "category": product.category,
            "quantity": product.quantity,
            "unit": product.unit,
            "price": product.price,
            "description": product.description,
            "image": product.image or existing_product.data["image"],
            "updated_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("products").update(product_data).eq("id", product_id).eq("seller_id", session["user_id"]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update product")
        logger.info(f"Product updated by {session['email']}: {product_id}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating product {product_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")

@app.delete("/products/{product_id}")
async def delete_product(product_id: str, session: dict = Depends(get_session)):
    try:
        try:
            uuid.UUID(product_id)
        except ValueError:
            logger.error(f"Invalid product_id format: {product_id}")
            raise HTTPException(status_code=400, detail="Invalid product ID format")

        existing_product = supabase.table("products").select("*").eq("id", product_id).eq("seller_id", session["user_id"]).single().execute()
        if not existing_product.data:
            raise HTTPException(status_code=404, detail="Product not found or you don't have permission to delete it")
        
        response = supabase.table("products").delete().eq("id", product_id).eq("seller_id", session["user_id"]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to delete product")
        logger.info(f"Product deleted by {session['email']}: {product_id}")
        return {"message": "Product deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting product {product_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")

@app.post("/orders")
async def create_order(order: Order, session: dict = Depends(get_session)):
    try:
        # Validate delivery info
        required_delivery_fields = ["full_name", "phone_number", "address", "city", "state", "pin_code"]
        for field in required_delivery_fields:
            if field not in order.delivery or not order.delivery[field]:
                raise HTTPException(status_code=400, detail=f"Missing or empty delivery field: {field}")

        # Validate delivery_method
        valid_delivery_methods = ["self_pickup", "parcel"]
        if order.delivery_method not in valid_delivery_methods:
            raise HTTPException(status_code=400, detail=f"Invalid delivery method. Must be one of {valid_delivery_methods}")

        # Validate payment_method
        valid_payment_methods = ["pay_on_delivery", "upi"]
        if order.payment_method not in valid_payment_methods:
            raise HTTPException(status_code=400, detail=f"Invalid payment method. Must be one of {valid_payment_methods}")

        # Validate products and check stock
        if not order.products:
            raise HTTPException(status_code=400, detail="No products in order")
        
        product_ids = [item.id for item in order.products]
        products = supabase.table("products").select("id, name, quantity, price, seller_id").in_("id", product_ids).execute()
        product_dict = {p["id"]: p for p in products.data}

        for item in order.products:
            try:
                uuid.UUID(item.id)
            except ValueError:
                logger.error(f"Invalid product_id format: {item.id}")
                raise HTTPException(status_code=400, detail=f"Invalid product ID format: {item.id}")
            
            if item.id not in product_dict:
                raise HTTPException(status_code=404, detail=f"Product not found: {item.id}")
            
            db_product = product_dict[item.id]
            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail=f"Invalid quantity for {item.name}")
            if item.quantity > db_product["quantity"]:
                raise HTTPException(status_code=400, detail=f"Insufficient quantity for {item.name}. Available: {db_product['quantity']}")
            if abs(item.price - db_product["price"]) > 0.01:
                raise HTTPException(status_code=400, detail=f"Price mismatch for {item.name}. Current price: {db_product['price']}")

        # Update product quantities and add seller_id to order items
        order_products = []
        for item in order.products:
            db_product = product_dict[item.id]
            new_quantity = db_product["quantity"] - item.quantity
            supabase.table("products").update({"quantity": new_quantity}).eq("id", item.id).execute()
            logger.info(f"Updated quantity for product {item.id}: {new_quantity}")
            order_products.append({
                "id": item.id,
                "name": item.name,
                "quantity": item.quantity,
                "price": item.price,
                "seller_id": db_product["seller_id"]
            })

        # Calculate total
        items_total = sum(item.price * item.quantity for item in order.products)
        delivery_fee = 40 if order.delivery_method == "parcel" else 0
        calculated_total = items_total + delivery_fee
        if abs(order.total - calculated_total) > 0.01:
            raise HTTPException(status_code=400, detail=f"Total mismatch. Expected: {calculated_total}, Provided: {order.total}")

        # Create order
        order_data = {
            "id": str(uuid.uuid4()),
            "buyer_id": session["user_id"],
            "products": order_products,
            "total_price": order.total,
            "delivery": order.delivery,
            "status": "Pending",
            "delivery_method": order.delivery_method,
            "payment_method": order.payment_method,
            "pickup_time": order.pickup_time.isoformat() if order.pickup_time else None,
            "tracking_link": order.tracking_link,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "delivery_fee": delivery_fee
        }
        response = supabase.table("orders").insert(order_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create order")

        logger.info(f"Order created by {session['email']}: {order_data['id']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating order for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

@app.get("/orders/{order_id}")
async def get_order(order_id: str, session: dict = Depends(get_session)):
    try:
        try:
            uuid.UUID(order_id)
        except ValueError:
            logger.error(f"Invalid order_id format: {order_id}")
            raise HTTPException(status_code=400, detail="Invalid order ID format")

        response = supabase.table("orders").select("*").eq("id", order_id).eq("buyer_id", session["user_id"]).single().execute()
        if not response.data:
            logger.error(f"Order not found: {order_id}")
            raise HTTPException(status_code=404, detail="Order not found or you don't have permission to view it")

        logger.info(f"Fetched order {order_id} for {session['email']}")
        return response.data
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching order {order_id} for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching order: {str(e)}")

@app.get("/orders")
async def get_user_orders(session: dict = Depends(get_session)):
    try:
        response = supabase.table("orders").select("*").eq("buyer_id", session["user_id"]).execute()
        logger.info(f"Fetched {len(response.data)} orders for {session['email']}")
        return response.data
    except Exception as e:
        logger.error(f"Error fetching orders for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

@app.get("/seller/orders")
async def get_seller_orders(session: dict = Depends(get_session)):
    try:
        orders = supabase.table("orders").select("*").execute().data
        seller_orders = []
        for order in orders:
            seller_products = [p for p in order["products"] if p.get("seller_id") == session["user_id"]]
            if seller_products:
                order_copy = order.copy()
                order_copy["products"] = seller_products
                seller_orders.append(order_copy)
        logger.info(f"Fetched {len(seller_orders)} orders for seller {session['email']}")
        return seller_orders
    except Exception as e:
        logger.error(f"Error fetching seller orders for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching seller orders: {str(e)}")

@app.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, session: dict = Depends(get_session)):
    try:
        try:
            uuid.UUID(order_id)
        except ValueError:
            logger.error(f"Invalid order_id format: {order_id}")
            raise HTTPException(status_code=400, detail="Invalid order ID format")

        # Fetch order
        order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not order.data:
            logger.error(f"Order not found: {order_id}")
            raise HTTPException(status_code=404, detail="Order not found")

        # Check if user is buyer or seller
        is_buyer = order.data["buyer_id"] == session["user_id"]
        seller_products = [p for p in order.data["products"] if p.get("seller_id") == session["user_id"]]
        is_seller = bool(seller_products)

        if not (is_buyer or is_seller):
            logger.error(f"User {session['email']} is neither buyer nor seller for order {order_id}")
            raise HTTPException(status_code=403, detail="You don't have permission to update this order")

        # Define valid statuses
        valid_statuses = {
            "self_pickup": ["Pending", "Ready for Pickup", "Delivered", "Cancelled"],
            "parcel": ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"]
        }
        if order.data["delivery_method"] not in valid_statuses:
            raise HTTPException(status_code=400, detail="Invalid delivery method in order")

        if status_update.status not in valid_statuses[order.data["delivery_method"]]:
            raise HTTPException(status_code=400, detail=f"Invalid status for {order.data['delivery_method']}. Must be one of {valid_statuses[order.data['delivery_method']]}")

        # Handle buyer cancellation
        if is_buyer and status_update.status == "Cancelled":
            if order.data["status"] not in ["Pending", "Processing"]:
                raise HTTPException(status_code=403, detail="Order cannot be cancelled at this stage")
            
            # Restock products
            for item in order.data["products"]:
                product = supabase.table("products").select("quantity").eq("id", item["id"]).single().execute()
                if product.data:
                    new_quantity = product.data["quantity"] + item["quantity"]
                    supabase.table("products").update({"quantity": new_quantity}).eq("id", item["id"]).execute()
                    logger.info(f"Restocked product {item['id']}: new quantity {new_quantity}")
                else:
                    logger.warning(f"Product {item['id']} not found for restocking")

        # Handle seller status updates
        elif is_seller:
            # Validate status transition for sellers
            valid_transitions = {
                "self_pickup": {
                    "Pending": ["Ready for Pickup"],
                    "Ready for Pickup": ["Delivered"],
                    "Delivered": [],
                    "Cancelled": []
                },
                "parcel": {
                    "Pending": ["Packed"],
                    "Packed": ["Shipped"],
                    "Shipped": ["Delivered"],
                    "Delivered": [],
                    "Cancelled": []
                }
            }
            current_status = order.data["status"]
            if current_status not in valid_transitions[order.data["delivery_method"]]:
                raise HTTPException(status_code=400, detail=f"Current status {current_status} is invalid")
            if status_update.status not in valid_transitions[order.data["delivery_method"]][current_status]:
                raise HTTPException(status_code=400, detail=f"Cannot transition from {current_status} to {status_update.status} for {order.data['delivery_method']}")
        else:
            raise HTTPException(status_code=403, detail="Invalid status update request")

        # Update status
        update_data = {
            "status": status_update.status,
            "updated_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("orders").update(update_data).eq("id", order_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update order status")

        logger.info(f"Order {order_id} status updated to {status_update.status} by {session['email']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating order {order_id} status for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")

@app.put("/orders/{order_id}/details")
async def update_order_details(
    order_id: str,
    details: dict,
    session: dict = Depends(get_session)
):
    try:
        try:
            uuid.UUID(order_id)
        except ValueError:
            logger.error(f"Invalid order_id format: {order_id}")
            raise HTTPException(status_code=400, detail="Invalid order ID format")

        # Fetch order
        order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not order.data:
            logger.error(f"Order not found: {order_id}")
            raise HTTPException(status_code=404, detail="Order not found")

        # Check if seller has products in the order
        seller_products = [p for p in order.data["products"] if p.get("seller_id") == session["user_id"]]
        if not seller_products:
            logger.error(f"Seller {session['email']} has no products in order {order_id}")
            raise HTTPException(status_code=403, detail="You don't have permission to update this order")

        # Validate details
        update_data = {
            "updated_at": datetime.utcnow().isoformat()
        }
        if "pickup_time" in details:
            if order.data["delivery_method"] != "self_pickup":
                raise HTTPException(status_code=400, detail="Pickup time only applicable for Self Pickup")
            try:
                pickup_time = datetime.fromisoformat(details["pickup_time"].replace("Z", "+00:00"))
                update_data["pickup_time"] = pickup_time.isoformat()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid pickup time format")
        if "tracking_link" in details:
            if order.data["delivery_method"] != "parcel":
                raise HTTPException(status_code=400, detail="Tracking link only applicable for Parcel")
            if not isinstance(details["tracking_link"], str) or len(details["tracking_link"]) > 500:
                raise HTTPException(status_code=400, detail="Invalid tracking link")
            update_data["tracking_link"] = details["tracking_link"]

        response = supabase.table("orders").update(update_data).eq("id", order_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update order details")

        logger.info(f"Order {order_id} details updated by {session['email']}")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating order {order_id} details for {session['email']}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order details: {str(e)}")