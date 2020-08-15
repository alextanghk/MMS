class CreateRegistrations < ActiveRecord::Migration[6.0]
  def change
    create_table :registrations do |t|
      t.references :member, foreign_key: true
      # Application form body
      t.string :zh_surname, :null => false, :index => true
      t.string :en_surname, :null => false, :index => true
      t.string :zh_first_name, :null => false, :index => true
      t.string :en_first_name, :null => false, :index => true
      t.string :hkid, :null => false, :index => true
      t.string :email, :index => true
      t.string :gender
      t.string :mobile
      t.integer :yob, :limit => 4
      t.date :dob
      t.string :home_phone
      t.string :home_address
      t.boolean :declare, :default => false
      t.boolean :agreement, :default => false
      # Job Usage
      t.string :uuid, :null => false, :limit => 50, :unique => true, :index => true
      t.string :comnpany
      t.string :department
      t.string :job_title
      t.string :employment_terms
      t.string :office_address
      t.string :office_phone
      t.attachment :proof
      # Admin Checking
      t.string :payment_method, :default => nil
      t.boolean :paid, :default => false
      t.datetime :paid_at
      t.string :receipt_no
      t.boolean :sent_confirmation, :default => false
      t.boolean :sent_payment_note, :default => false
      t.boolean :sent_receipt, :default => false
      # System Usage
      t.string :status, :default => "New"
      t.boolean :is_valid, :default => false
      t.text :remark
      t.boolean :is_deleted, :default => false
      t.string :created_by
      t.string :updated_by
      t.timestamps
    end
  end
end
