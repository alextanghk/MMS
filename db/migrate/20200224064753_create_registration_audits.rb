class CreateRegistrationAudits < ActiveRecord::Migration[6.0]
  def change
    create_table :registration_audits do |t|
      t.references :registration, null: false, foreign_key: true
      t.string :payment_method, :default => nil
      t.boolean :paid, :default => false
      t.datetime :paid_at
      t.string :receipt_no
      t.boolean :sent_confirmation, :default => false
      t.boolean :sent_payment_note, :default => false
      t.boolean :sent_receipt, :default => false
      t.boolean :is_deleted, :default => false
      t.string :created_by
      t.string :updated_by
      t.timestamps
    end
  end
end
