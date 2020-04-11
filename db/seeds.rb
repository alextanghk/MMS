# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


# Create Acces Right
defaultAccess = [
    # For Super Admin
    { code: 'ALL_REQUEST', displayname: "Full Access", function: "All", category: "Full", func_weight: 0, cat_weight: 0, weight: 0, is_display: true },
    # For Registration
    { code: 'GET_REGISTRATION', displayname: "View", function: "Registration", category: "All", func_weight: 1, cat_weight: 0, weight: 0, is_display: true },
    { code: 'POST_REGISTRATION', displayname: "Create", function: "Registration", category: "All", func_weight: 1, cat_weight: 0, weight: 0, is_display: true },
    { code: 'PUT_REGISTRATION', displayname: "Edit", function: "Registration", category: "All", func_weight: 1, cat_weight: 0, weight: 0, is_display: true },
    { code: 'DELETE_REGISTRATION', displayname: "Delete", function: "Registration", category: "All", func_weight: 1, cat_weight: 0, weight: 0, is_display: true },
    { code: 'UPDATE_REGISTRATION_AFTER_APPROVED', displayname: "Update after approved", function: "Registration", category: "All", func_weight: 1, cat_weight: 0, weight: 0, is_display: true },
    { code: 'APPROVE_REGISTRATION', displayname: "Approve", function: "Registration", category: "Status", func_weight: 1, cat_weight: 1, weight: 0, is_display: true },
    { code: 'CANCEL_REGISTRATION', displayname: "Cancel", function: "Registration", category: "Status", func_weight: 1, cat_weight: 1, weight: 0, is_display: true },
    { code: 'WITHDRAW_REGISTRATION', displayname: "Withdraw", function: "Registration", category: "Status", func_weight: 1, cat_weight: 1, weight: 0, is_display: true },
    # For Members
    { code: 'GET_MEMBER', displayname: "View", function: "Members", category: "All", func_weight: 2, cat_weight: 0, weight: 0, is_display: true },
    { code: 'POST_MEMBER', displayname: "Create", function: "Members", category: "All", func_weight: 2, cat_weight: 0, weight: 0, is_display: true },
    { code: 'PUT_MEMBER', displayname: "Edit", function: "Members", category: "All", func_weight: 2, cat_weight: 0, weight: 0, is_display: true },
    { code: 'DELETE_MEMBER', displayname: "Delete", function: "Members", category: "All", func_weight: 2, cat_weight: 0, weight: 0, is_display: true },
    # For Users
    { code: 'GET_USER', displayname: "View", function: "Users", category: "All", func_weight: 3, cat_weight: 0, weight: 0, is_display: true },
    { code: 'POST_USER', displayname: "Create", function: "Users", category: "All", func_weight: 3, cat_weight: 0, weight: 0, is_display: true },
    { code: 'PUT_USER', displayname: "Edit", function: "Users", category: "All", func_weight: 3, cat_weight: 0, weight: 0, is_display: true },
    { code: 'DELETE_USER', displayname: "Delete", function: "Users", category: "All", func_weight: 3, cat_weight: 0, weight: 0, is_display: true },
    # For Users Group
    { code: 'GET_USER_GROUP', displayname: "View", function: "User Groups", category: "All", func_weight: 4, cat_weight: 0, weight: 0, is_display: true },
    { code: 'POST_USER_GROUP', displayname: "Create", function: "User Groups", category: "All", func_weight: 4, cat_weight: 0, weight: 0, is_display: true },
    { code: 'PUT_USER_GROUP', displayname: "Edit", function: "User Groups", category: "All", func_weight: 4, cat_weight: 0, weight: 0, is_display: true },
    { code: 'DELETE_USER_GROUP', displayname: "Delete", function: "User Groups", category: "All", func_weight: 4, cat_weight: 0, weight: 0, is_display: true },
    # For Account
    { code: 'GET_ACCOUNT', displayname: "View", function: "Accounts", category: "All", func_weight: 5, cat_weight: 0, weight: 0, is_display: true },
    { code: 'POST_ACCOUNT', displayname: "Create", function: "Accounts", category: "All", func_weight: 5, cat_weight: 0, weight: 0, is_display: true },
    { code: 'PUT_ACCOUNT', displayname: "Edit", function: "Accounts", category: "All", func_weight: 5, cat_weight: 0, weight: 0, is_display: true },
    { code: 'DELETE_ACCOUNT', displayname: "Delete", function: "Accounts", category: "All", func_weight: 5, cat_weight: 0, weight: 0, is_display: true },
    # For Transitions
    { code: 'GET_TRANSACTION', displayname: "View", function: "Transitions", category: "All", func_weight: 6, cat_weight: 0, weight: 0, is_display: true },
    { code: 'POST_TRANSACTION', displayname: "Create", function: "Transitions", category: "All", func_weight: 6, cat_weight: 0, weight: 0, is_display: true },
    { code: 'PUT_TRANSACTION', displayname: "Edit", function: "Transitions", category: "All", func_weight: 6, cat_weight: 0, weight: 0, is_display: true },
    { code: 'DELETE_TRANSACTION', displayname: "Delete", function: "Transitions", category: "All", func_weight: 6, cat_weight: 0, weight: 0, is_display: true },
    { code: 'APPROVE_TRANSACTION', displayname: "Approve", function: "Transitions", category: "Status", func_weight: 6, cat_weight: 1, weight: 0, is_display: true },
    # For Claim
    { code: 'GET_CLAIM', displayname: "View", function: "Claims", category: "All", func_weight: 7, cat_weight: 0, weight: 0, is_display: true },
    { code: 'POST_CLAIM', displayname: "Create", function: "Claims", category: "All", func_weight: 7, cat_weight: 0, weight: 0, is_display: true },
    { code: 'PUT_CLAIM', displayname: "Edit", function: "Claims", category: "All", func_weight: 7, cat_weight: 0, weight: 0, is_display: true },
    { code: 'DELETE_CLAIM', displayname: "Delete", function: "Claims", category: "All", func_weight: 7, cat_weight: 0, weight: 0, is_display: true },
    { code: 'APPROVE_CLAIM', displayname: "Approve", function: "Claims", category: "Status", func_weight: 7, cat_weight: 1, weight: 0, is_display: true },
    { code: 'HANDLE_CLAIM', displayname: "Handle", function: "Claims", category: "Status", func_weight: 7, cat_weight: 1, weight: 0, is_display: true },
    { code: 'REJECT_CLAIM', displayname: "Reject", function: "Claims", category: "Status", func_weight: 7, cat_weight: 1, weight: 0, is_display: true },
    # For System
    { code: 'GET_SYS_CONFIG', displayname: "View", function: "System Config", category: "All", func_weight: 8, cat_weight: 0, weight: 0, is_display: false },
    { code: 'PUT_SYS_CONFIG', displayname: "Edit", function: "System Config", category: "All", func_weight: 8, cat_weight: 0, weight: 0, is_display: false },

]
AccessRight.create(defaultAccess)

accessright = AccessRight.find_by(code: "ALL_REQUEST")

usergroup = UserGroup.new({name: "Super Admin"})
usergroup.save

GroupAccess.create({
    user_group: usergroup,
    access_right: accessright
})

User.create({
    user_group: usergroup,
    zh_name: "系統管理員",
    en_name: "Administrator",
    user_name: "administrator",
    email: "harvest.intech@gmail.com",
    password: "abcd1234",
    password_confirmation: "abcd1234",
    mobile: "",
    is_actived: true
})

Account.create({
    bank: "Default",
    is_default: true
})

defaultConfig = [
    { code: "APPLY_RESPONSE_MSG",display_name:"Application Response Message",content:"Welcome"}
]
SystemConfig.create(defaultConfig)