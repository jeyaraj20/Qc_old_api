//-------------------------- ExamSectionDetails Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const SchoolExamSectionDetails = sequelize.define(
        "SchoolExamSectionDetails",
        {
            sect_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            exam_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            schoolid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            main_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            sub_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            menu_title: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            no_ofquest: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            mark_perquest: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            tot_marks: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            neg_mark: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            cut_off: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            sect_time: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            sect_date: {
                type: DataTypes.DATEONLY,
                defaultValue: null,
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__schoolexam_sectdetails" }
    );
    return SchoolExamSectionDetails;
};

//-------------------------- ExamSectionDetails Model End ------------------------------//
