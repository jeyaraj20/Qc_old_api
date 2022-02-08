//-------------------------- Category Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const Country = sequelize.define(
        "Country",
        {
            country_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            iso: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            country_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            nicename: {
                type: DataTypes.STRING,
                defaultValue: null,
                unique: true,
            },
            iso3: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            numcode: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            phonecode: {
                type: DataTypes.INTEGER,
                defaultValue: null
            },
            country_status: {
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
        { timestamps: false, tableName: "tbl__country" }
    );
    return Country;
};

//-------------------------- Category Model End ------------------------------//
