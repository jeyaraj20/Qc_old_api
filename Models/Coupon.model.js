//-------------------------- Category Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define(
        "Coupon",
        {
            coupon_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            coupon_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            coupon_code: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            coupon_value: {
                type: DataTypes.DOUBLE,
                defaultValue: null,
            },
            coupon_value_type: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cart_value_range: {
                type: DataTypes.DOUBLE,
                defaultValue: null,
            },
            cart_value_range_type: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cart_value: {
                type: DataTypes.DOUBLE,
                defaultValue: null,
            },
            no_of_usage: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            no_of_usage_user: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            from_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            to_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            coupon_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
        },
        { timestamps: false, tableName: "tbl__coupon" }
    );
    return Coupon;
};

//-------------------------- Category Model End ------------------------------//
