import { pool } from "@/lib/db/client";

async function main(): Promise<void> {
  console.log("Running database migrations...");
  const startTime = Date.now();

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pincode VARCHAR(20) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) DEFAULT 'IN' NOT NULL,
        district VARCHAR(100) NOT NULL,
        area VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mob_no VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'CUSTOMER' NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
        is_profile_complete BOOLEAN DEFAULT FALSE NOT NULL,
        address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS shops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        drug_licence_number VARCHAR(100) NOT NULL,
        pharmacist_name VARCHAR(255) NOT NULL,
        pharmacist_registration_number VARCHAR(100) NOT NULL,
        gstin VARCHAR(100) NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        address_id UUID REFERENCES addresses(id) ON DELETE CASCADE NOT NULL,
        image_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS medicines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
        description VARCHAR(255) NOT NULL,
        batch_no VARCHAR(100) NOT NULL,
        mrp NUMERIC(10, 2) NOT NULL,
        rate NUMERIC(10, 2) NOT NULL,
        gst_rate NUMERIC(5, 2) NOT NULL,
        exp_date VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        hsn_code VARCHAR(100) NOT NULL,
        pack_size VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS buyers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        gstin VARCHAR(100),
        drug_licence_number VARCHAR(100),
        is_b2b BOOLEAN DEFAULT FALSE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
        buyer_id UUID REFERENCES buyers(id) ON DELETE RESTRICT NOT NULL,
        invoice_no VARCHAR(100) NOT NULL,
        invoice_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        sub_total NUMERIC(12, 2) NOT NULL,
        discount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
        cgst_total NUMERIC(12, 2) NOT NULL,
        sgst_total NUMERIC(12, 2) NOT NULL,
        net_amount NUMERIC(12, 2) NOT NULL,
        payment_mode VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) NOT NULL,
        doctor_name VARCHAR(255),
        doctor_reg_no VARCHAR(100),
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS invoice_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
        medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
        description VARCHAR(255) NOT NULL,
        batch_no VARCHAR(100) NOT NULL,
        exp_date VARCHAR(50) NOT NULL,
        hsn_code VARCHAR(100) NOT NULL,
        pack_size VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        free_quantity INTEGER DEFAULT 0 NOT NULL,
        mrp NUMERIC(10, 2) NOT NULL,
        rate NUMERIC(10, 2) NOT NULL,
        gst_rate NUMERIC(5, 2) NOT NULL,
        taxable_amount NUMERIC(12, 2) NOT NULL,
        cgst_amount NUMERIC(12, 2) NOT NULL,
        sgst_amount NUMERIC(12, 2) NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    const duration = Date.now() - startTime;
    console.log(`Success: All database migrations completed (${duration}ms)`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();