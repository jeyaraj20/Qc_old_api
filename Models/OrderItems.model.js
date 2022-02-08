//-------------------------- Questions Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const OrderItems = sequelize.define(
        "OrderItems",
        {
            order_items_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            order_ref_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            order_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exam_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            order_type: {
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
        { timestamps: false, tableName: "tbl__orderitems" }
    );
    return OrderItems;
};

//-------------------------- Questions Model End ------------------------------//
