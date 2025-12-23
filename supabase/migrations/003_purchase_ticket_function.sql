-- Migration: Add atomic purchase_ticket function
-- Purpose: Prevent race conditions when purchasing tickets
-- 
-- This function ensures that:
-- 1. Ticket availability is checked
-- 2. Ticket is created
-- 3. Seat count is updated
-- ... all in a single ATOMIC transaction with ROW LOCK
--
-- Without this, concurrent purchases could oversell tickets!

CREATE OR REPLACE FUNCTION purchase_ticket(
  p_user_id UUID,
  p_event_id UUID,
  p_category_id UUID,
  p_quantity INT
)
RETURNS TABLE(
  ticket_id UUID,
  ticket_number TEXT,
  new_available_seats INT
) AS $$
DECLARE
  v_available_seats INT;
  v_ticket_id UUID;
  v_ticket_number TEXT;
  v_unit_price DECIMAL;
  v_total_price DECIMAL;
  v_qr_code_url TEXT;
BEGIN
  -- 1️⃣ LOCK the ticket_categories row to prevent race conditions
  -- Other requests must WAIT until this transaction completes
  SELECT 
    available_seats,
    price
  INTO 
    v_available_seats,
    v_unit_price
  FROM ticket_categories
  WHERE id = p_category_id
  FOR UPDATE; -- 🔒 ROW LOCK - prevents concurrent updates
  
  -- 2️⃣ Check if enough seats available
  IF v_available_seats < p_quantity THEN
    RAISE EXCEPTION 'Insufficient seats available. Requested: %, Available: %', p_quantity, v_available_seats;
  END IF;
  
  -- 3️⃣ Generate ticket number and QR code URL
  v_ticket_number := 'ASTRA-' || to_char(CURRENT_TIMESTAMP, 'YYMMDDHHMMSS') || '-' || SUBSTR(md5(random()::text), 1, 6);
  v_total_price := v_unit_price * p_quantity;
  v_qr_code_url := 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://jsquare.com/tickets/' || v_ticket_number;
  
  -- 4️⃣ Create the ticket
  INSERT INTO tickets (
    user_id,
    event_id,
    category_id,
    ticket_number,
    quantity,
    unit_price,
    total_price,
    status,
    qr_code_url,
    purchase_time,
    created_at
  ) VALUES (
    p_user_id,
    p_event_id,
    p_category_id,
    v_ticket_number,
    p_quantity,
    v_unit_price,
    v_total_price,
    'confirmed',
    v_qr_code_url,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  RETURNING id INTO v_ticket_id;
  
  -- 5️⃣ Atomically update available seats
  UPDATE ticket_categories
  SET available_seats = available_seats - p_quantity
  WHERE id = p_category_id;
  
  -- 6️⃣ Return results
  RETURN QUERY
  SELECT 
    v_ticket_id,
    v_ticket_number,
    (v_available_seats - p_quantity)::INT;
    
  -- 🔓 ROW LOCK automatically released at end of transaction
END;
$$ LANGUAGE plpgsql;

-- Grant permission to authenticated users to call this function
GRANT EXECUTE ON FUNCTION purchase_ticket(UUID, UUID, UUID, INT) TO authenticated;
