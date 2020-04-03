class CreateGroupAccesses < ActiveRecord::Migration[6.0]
  def change
    create_table :group_accesses do |t|
      t.references :user_group, null: false, foreign_key: true
      t.references :access_right, null: false, foreign_key: true

      t.timestamps
    end
  end
end
