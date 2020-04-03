class CreateAccessRights < ActiveRecord::Migration[6.0]
  def change
    create_table :access_rights do |t|
      t.string :code, :null => false, :index => true, :unique => true
      t.string :displayname, :null => false
      t.string :function, :null => false
      t.string :category, :null => false
      t.integer :weight, :default => 0, :null => false
      t.boolean :is_display, :default => false
      t.boolean :is_deleted, :default => false
      t.timestamps
    end
  end
end
