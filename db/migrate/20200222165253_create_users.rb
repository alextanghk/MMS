class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.references :user_group, null: false, foreign_key: true
      t.string :zh_name, :null => false, :index => true
      t.string :en_name, :null => false, :index => true
      t.string :user_name, :null => false, :index => true
      t.string :email, :index => true
      t.string :password_digest
      t.string :mobile
      t.boolean :is_deleted, :default => false
      t.boolean :is_actived, :default => false
      t.string :created_by
      t.string :updated_by
      t.timestamps
    end
  end
end
