//-------------------------- Admin Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const SchoolExamresultQc = sequelize.define(
        "SchoolExamresultQc",
        {
            result_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            school_id: {
                type: DataTypes.INTEGER,
            },
            stud_id: {
                type: DataTypes.INTEGER,
            },
            taken_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },

            quest_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            

            sect_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
                allowNull: true,
            },
            attend_ans: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            review_val: {
                type: DataTypes.STRING,
                defaultValue: null,
                allowNull: true,
            },
            crt_ans: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            crt_mark: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            
            neg_mark: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            ipaddress: {
                type: DataTypes.STRING,
                defaultValue: null 
            },
            attend_date: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            }
            
        },
        { timestamps: false, tableName: "tbl__schoolexam_result_qc" }
    );
    return SchoolExamresultQc;
};

//-------------------------- Admin Model End ------------------------------//
