//-------------------------- HomeCategory Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const HomeCategory = sequelize.define(
        "HomeCategory",
        {
            exa_cat_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            exaid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exaid_sub: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            examcat_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["M", "C", "S"],
            },
            exa_cat_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exa_cat_slug: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exa_cat_image: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exa_cat_pos: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exa_cat_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            exa_cat_dt: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            exa_cat_lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__home_category" }
    );
    return HomeCategory;
};

//-------------------------- HomeCategory Model End ------------------------------//
