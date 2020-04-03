class CreateClaims < ActiveRecord::Migration[6.0]
  def change
    create_table :claims do |t|
      t.references :transition, null: true
      t.string :uuid
      t.string :invoice_number, null: false
      t.string :item_name, null: false
      t.string :description
      t.string :paid_by
      t.datetime :paid_at
      t.decimal :amount, precision: 10, scale: 2
      t.attachment :receipt
      t.string :status, :default => "New"
      t.boolean :is_deleted, :default => false
      t.string :created_by
      t.string :updated_by
      t.timestamps
    end
  end
end
