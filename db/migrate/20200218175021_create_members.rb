class CreateMembers < ActiveRecord::Migration[6.0]
  def change
    create_table :members do |t|
      t.string :uuid, :null => false, :limit => 50, :unique => true, :index => true
      t.string :zh_surname, :null => false, :index => true
      t.string :en_surname, :null => false, :index => true
      t.string :zh_first_name, :null => false, :index => true
      t.string :en_first_name, :null => false, :index => true
      t.string :member_ref, :index => true
      t.string :gender
      t.string :email, :index => true
      t.string :password_digest
      t.string :mobile
      t.string :home_phone
      t.string :home_address
      t.string :hkid
      t.string :comnpany
      t.string :department
      t.string :job_title
      t.string :employment_terms
      t.string :office_address
      t.string :office_phone
      t.string :emergency_contact
      t.string :emergency_relation
      t.string :emergency_number
      t.integer :yob, :limit => 4
      t.date :dob
      t.boolean :subscription, :default => true
      t.boolean :sent_group_invite, :default => false
      t.boolean :is_deleted, :default => false
      t.boolean :is_actived, :default => false
      t.attachment :profile
      t.text :remark
      t.string :created_by
      t.string :updated_by
      t.timestamps
    end
  end
end
