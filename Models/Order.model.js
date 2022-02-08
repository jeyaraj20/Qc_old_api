//-------------------------- Questions Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const Orders = sequelize.define(
        "Orders",
        {
            order_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            order_ref_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            student_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            payment_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            payment_status: {
                type: DataTypes.INTEGER,
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
            promocode: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            paymentdate: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__order" }
    );
    return Orders;
};

//-------------------------- Questions Model End ------------------------------//
