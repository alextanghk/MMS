class CreateTransactions < ActiveRecord::Migration[6.0]
  def change
    create_table :transactions do |t|
      t.references :account, null: false, foreign_key: true
      t.string :uuid
      t.string :invoice_number, null: false
      t.string :item_name, null: false
      t.string :payment_method
      t.string :provider
      t.string :item_type
      t.string :description
      t.datetime :transaction_date
      t.attachment :receipt
      t.string :approved_by
      t.string :approved_at
      t.decimal :amount, precision: 10, scale: 2
      t.boolean :is_approved, :default => false
      t.boolean :is_deleted, :default => false
      t.string :created_by
      t.string :updated_by
      t.timestamps
    end
  end
end
