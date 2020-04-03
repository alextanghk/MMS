class CreateUserTokens < ActiveRecord::Migration[6.0]
  def change
    create_table :user_tokens do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token, :index => true, :null => false
      t.datetime :exp_date
      t.string :auth_type
      t.string :login_ip
      t.boolean :is_deleted, :default => false
      t.timestamps
    end
  end
end
