//-------------------------- Notes Model Start ------------------------------//
module.exports = (sequelize, DataTypes) => {
    const Notes = sequelize.define(
        "Notes",
        {
            notesId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            chapterId: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            notesName: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            notesType: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            notesUrl: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            notesPosition: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            createdBy : {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            notesStatus: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
        },
        { timestamps: true, tableName: "tbl__notes" }
    );
    return Notes;
};

//-------------------------- Category Model End ------------------------------//
