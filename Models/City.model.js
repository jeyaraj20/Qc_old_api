//-------------------------- Category Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const City = sequelize.define(
        "City",
        {
            city_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            state_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            city_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            city_code: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            city_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__city" }
    );
    return City;
};

//-------------------------- Category Model End ------------------------------//
