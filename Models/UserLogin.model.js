//-------------------------- User Login Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const UserLogin = sequelize.define(
        "UserLogin",
        {
            user_login_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            stud_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            user_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            logged_out: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            logged_in_at: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            logged_out_at: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            ip_address: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            token_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            token_secret: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            token_deleted: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            device: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            logout_flag: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            mobile_flag: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__User_Login" }
    );
    return UserLogin;
};

//-------------------------- User Login Model End ------------------------------//
