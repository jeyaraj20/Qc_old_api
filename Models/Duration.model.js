//-------------------------- Category Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const Duration = sequelize.define(
        "Duration",
        {
            duration_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            duration: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__duration" }
    );
    return Duration;
};

//-------------------------- Category Model End ------------------------------//
