//-------------------------- Exam Chapters Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const ExamChapters  = sequelize.define(
        "ExamChapters",
        {
            chapt_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            exa_cat_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exmain_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exsub_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            chapter_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            chapter_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            chapter_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
            paymentFlag: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
        },
        { timestamps: false, tableName: "tbl__examchapters" }
    );
    return ExamChapters;
};

//-------------------------- Exam Chapters Model End ------------------------------//
