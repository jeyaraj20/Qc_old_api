//-------------------------- ExamRatings Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const ExamRatings = sequelize.define(
        "ExamRatings",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            exa_cat_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            examcat_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["M", "C", "S"],
            },
            exa_rating: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exa_icon_image: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__exam_ratings" }
    );

    return ExamRatings;
};

//-------------------------- ExamRatings Model End ------------------------------//
