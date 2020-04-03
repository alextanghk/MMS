Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  namespace :api do
    namespace :v1 do
      scope :controller => "registrations", :path => "/registrations" do
        get "/" => :list
        get "/:item_id" => :get
        post "/create" => :create
        put "/cancel/:item_id" => :cancel
        put "/withdraw/:item_id" => :withdraw
        put "/approve/:item_id" => :complete
        put "/update/:item_id" => :update
        delete "/delete/:item_id" => :delete
      end

      scope :controller => "auth", :path => "/auth" do
        get "/" => :index
        post "login" => :login
        post "logout" => :logout
      end

      scope :controller => "members", :path => "/members" do
        get "/" => :list
        get "/:item_id" => :get
        post "/create" => :create
        put "/update/:item_id" => :update
      end

      scope :controller => "access_rights", :path => "/accesses" do
        get "/" => :list
        get "/check" => :check
      end

      scope :controller => "user_groups", :path => "/user_groups" do
        get "/" => :list
        get "/:item_id" => :get
        post "/create" => :create
        put "/update/:item_id" => :update
        delete "/delete/:item_id" => :delete
      end

      scope :controller => "users", :path => "/users" do
        get "/" => :list
        get "/profile" => :profile
        put "/profile" => :update_profile
        get "/:item_id" => :get
        post "/create" => :create
        put "/update/:item_id" => :update
        delete "/delete/:item_id" => :delete
      end

      scope :controller => "accounts", :path => "/accounts" do
        get "/" => :list
        get "/:item_id" => :get
        post "/create" => :create
        put "/update/:item_id" => :update
        delete "/delete/:item_id" => :delete
      end

      scope :controller => "transactions", :path => "/transactions" do
        get "/" => :list
        get "/:item_id" => :get
        post "/create" => :create
        put "/update/:item_id" => :update
        delete "/delete/:item_id" => :delete
      end

      scope :controller => "claims", :path => "/claims" do
        get "/" => :list
        get "/:item_id" => :get
        post "/create" => :create
        put "/update/:item_id" => :update
        put "/approve/:item_id" => :approve
        put "/reject/:item_id" => :reject
        put "/cancel/:item_id" => :cancel
        delete "/delete/:item_id" => :delete
      end

      scope :controller => "configs", :path => "/configs" do
        get "/" => :list
        get "/code/:code" => :get_by_code
        get "/:item_id" => :get
        put "/update/:item_id" => :update
      end
    end
  end
  
  get '*path', to: 'application#frontend_index_html', constraints: lambda { |request|
    !request.xhr? && request.format.html?
  }
end
