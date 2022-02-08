//-------------------------- Questions Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const CartItems = sequelize.define(
        "CartItems",
        {
            cart_items_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            master_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            main_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            sub_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            chapt_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            product_title: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            item_type: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            amount: {
                type: DataTypes.DOUBLE,
                defaultValue: null,
            },
            cgst: {
                type: DataTypes.DOUBLE,
                defaultValue: null,
            },
            sgst: {
                type: DataTypes.DOUBLE,
                defaultValue: null,
            },
            student_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            payment_status: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__cart_items" }
    );
    return CartItems;
};

//-------------------------- Questions Model End ------------------------------//
