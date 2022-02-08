//-------------------------- Category Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const State = sequelize.define(
        "State",
        {
            state_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            country_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            state_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            country_code: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            state_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            lastdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__state" }
    );
    return State;
};

//-------------------------- Category Model End ------------------------------//
