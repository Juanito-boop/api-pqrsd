-- Create types/enums first
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'analyst');
CREATE TYPE pqrsd_type AS ENUM ('peticion', 'queja', 'reclamo', 'sugerencia', 'denuncia', 'derecho-de-peticion', 'tutela');
CREATE TYPE pqrsd_status AS ENUM ('recibida', 'en_proceso', 'asignada', 'respondida', 'cerrada');
CREATE TYPE priority AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE petitioner_type AS ENUM ('persona_natural', 'persona_juridica');
CREATE TYPE id_type AS ENUM ('cedula', 'nit', 'pasaporte', 'cedula_extranjeria');

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  manager_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role DEFAULT 'operator',
  department_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create pqrsd_requests table
CREATE TABLE IF NOT EXISTS pqrsd_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_number text UNIQUE NOT NULL,
  type pqrsd_type NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  petitioner_type petitioner_type NOT NULL,
  petitioner_name text NOT NULL,
  petitioner_email text NOT NULL,
  petitioner_phone text NOT NULL,
  petitioner_address text NOT NULL,
  petitioner_id_type id_type NOT NULL,
  petitioner_id_number text NOT NULL,
  priority priority DEFAULT 'media',
  status pqrsd_status DEFAULT 'recibida',
  assigned_department_id uuid,
  assigned_user_id uuid,
  due_date timestamptz NOT NULL,
  response_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_pqrsd_department FOREIGN KEY (assigned_department_id) REFERENCES departments(id),
  CONSTRAINT fk_pqrsd_user FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

-- Create pqrsd_comments table
CREATE TABLE IF NOT EXISTS pqrsd_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pqrsd_id uuid NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_comments_pqrsd FOREIGN KEY (pqrsd_id) REFERENCES pqrsd_requests(id),
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create pqrsd_attachments table
CREATE TABLE IF NOT EXISTS pqrsd_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pqrsd_id uuid NOT NULL,
  filename text NOT NULL,
  original_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_attachments_pqrsd FOREIGN KEY (pqrsd_id) REFERENCES pqrsd_requests(id)
);

-- Create pqrsd_status_history table
CREATE TABLE IF NOT EXISTS pqrsd_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pqrsd_id uuid NOT NULL,
  previous_status text,
  new_status text NOT NULL,
  changed_by uuid,
  change_reason text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_history_pqrsd FOREIGN KEY (pqrsd_id) REFERENCES pqrsd_requests(id),
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Add foreign key for department manager
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_manager 
FOREIGN KEY (manager_id) REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pqrsd_filing_number ON pqrsd_requests(filing_number);
CREATE INDEX IF NOT EXISTS idx_pqrsd_status ON pqrsd_requests(status);
CREATE INDEX IF NOT EXISTS idx_pqrsd_type ON pqrsd_requests(type);
CREATE INDEX IF NOT EXISTS idx_pqrsd_created_at ON pqrsd_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_pqrsd_due_date ON pqrsd_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_pqrsd_assigned_dept ON pqrsd_requests(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_pqrsd_assigned_user ON pqrsd_requests(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pqrsd_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pqrsd_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pqrsd_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pqrsd_status_history ENABLE ROW LEVEL SECURITY;

-- NOTE: This project doesn't use Supabase helper `auth.uid()`.
-- Applications should set a session GUC named `app.current_user_id`
-- to the current user's UUID before running queries so RLS policies
-- can identify the acting user. Example (from the client/session):
--   SELECT set_config('app.current_user_id', '00000000-0000-0000-0000-000000000000', false);

-- Create RLS policies for departments
CREATE POLICY "Admin full access to departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

CREATE POLICY "Users can view their own department"
  ON departments
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT department_id FROM users 
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_active = true
    )
  );

-- Create RLS policies for users
CREATE POLICY "Admin full access to users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = (current_setting('app.current_user_id', true))::uuid);

-- Create RLS policies for PQRSD requests
CREATE POLICY "Admin full access to pqrsd"
  ON pqrsd_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

CREATE POLICY "Users can view assigned pqrsd"
  ON pqrsd_requests
  FOR SELECT
  TO authenticated
  USING (
    assigned_user_id = (current_setting('app.current_user_id', true))::uuid
    OR assigned_department_id IN (
      SELECT department_id FROM users 
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_active = true
    )
  );

-- Insert sample data
INSERT INTO departments (id, name, description) VALUES
  (gen_random_uuid(), 'Servicio al Cliente', 'Atención general al cliente'),
  (gen_random_uuid(), 'Jurídico', 'Asuntos legales y normativos'),
  (gen_random_uuid(), 'Operaciones', 'Gestión operativa');