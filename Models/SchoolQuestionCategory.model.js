//-------------------------- Category Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const SchoolQuestionCategory = sequelize.define(
        "SchoolQuestionCategory",
        {
            cat_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            schoolid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            pid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            cat_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cat_slug: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cat_code: {
                type: DataTypes.STRING,
                defaultValue: null,
                unique: true,
            },
            cat_desc: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cat_image: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cat_pos: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            cat_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            cat_dt: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            cat_lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__school_question_category" }
    );
    return SchoolQuestionCategory;
};

//-------------------------- Category Model End ------------------------------//
