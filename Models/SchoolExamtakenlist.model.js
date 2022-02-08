//-------------------------- Admin Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const SchoolExamtakenlist = sequelize.define(
        "SchoolExamtakenlist",
        {
            taken_id: {
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
            exam_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_type: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exam_type_cat: {
                type: DataTypes.STRING,
                defaultValue: null,
            },

            exam_type_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            post_mark: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            neg_mark: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            tot_quest: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            
            tot_attend: {
                type: DataTypes.INTEGER,
                defaultValue: 0.0,
            },
            not_attend: {
                type: DataTypes.INTEGER,
                defaultValue: 0.0,
            },
            not_answered: {
                type: DataTypes.INTEGER,
                defaultValue: 0.0,
            },

            skip_quest: {
                type: DataTypes.INTEGER,
                defaultValue: 0.0,
            },

            answ_crt: {
                type: DataTypes.INTEGER,
                defaultValue: 0.0,
            },

            answ_wrong: {
                type: DataTypes.INTEGER,
                defaultValue: 0.0,
            },
            tot_postimark: {
                type: DataTypes.DECIMAL,
                defaultValue: 0.0,
            },
            tot_negmarks: {
                type: DataTypes.DECIMAL,
                defaultValue: 0.0,
            },

            total_mark: {
                type: DataTypes.DECIMAL,
                defaultValue: 0.0,
            },
            
            start_time: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
                defaultValue: '2000-01-01 00:00:00',
            },

            end_time: {
                type: DataTypes.DATE
            },
            exam_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["S", "C", "SYS"],
            },
            ip_addr: {
                type: DataTypes.STRING,
                defaultValue: null 
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            }
            
        },
        { timestamps: false, tableName: "tbl__schoolexamtaken_list" }
    );
    return SchoolExamtakenlist;
};

//-------------------------- Admin Model End ------------------------------//
