class CreateSystemConfigs < ActiveRecord::Migration[6.0]
  def change
    create_table :system_configs do |t|
      t.string :code
      t.string :display_name
      t.text :content
      t.boolean :is_deleted, :default => false
      t.string :created_by
      t.string :updated_by
      t.timestamps
    end
  end
end
