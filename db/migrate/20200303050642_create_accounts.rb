class CreateAccounts < ActiveRecord::Migration[6.0]
  def change
    create_table :accounts do |t|
      t.string :bank, null: false
      t.text :remark
      t.boolean :is_default, :default => false
      t.boolean :is_actived, :default => true
      t.boolean :is_deleted, :default => false
      t.string :created_by
      t.string :updated_by
      t.timestamps
    end
  end
end
