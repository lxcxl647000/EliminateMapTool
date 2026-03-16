export class GameConstant {
    public static LUCKY_TURNTABLE_DATA_KEY: string = "LUCKY_TURNTABLE_DATA_KEY";
    public static SoundVal_KEY: string = "SoundVal_KEY";
    public static MusicVal_KEY: string = "MusicVal_KEY";
    public static Force_Guide_Level_1_KEY: string = "Force_Guide_Level_1_KEY";
    public static AdZoneUrlType = 'AdZoneUrlType';

    static DisappearLigthDelay: number = .433;
    static DisappearTime: number = 0.165;
    static ToTargetTime: number = 0.5;
    static DropTime: number = 0.166;
    static ChangeProgressTime: number = 0.2;

    // 复活增加步数//
    public static Resurrection_Add_Steps = 5;
    // 增加步数道具增加步数//
    public static Tool_Add_Steps = 3;
    // 每局消耗体力//
    public static Energy_Cost = 10;
    // 幸运转盘每天总使用次数//
    public static LuckyTurntable_TotalNum = 10;

    public static LineLightDelayTime: number = (18 / 30) * 1000;
    public static BoomLightDelayTime: number = (20 / 30) * 1000;
    // 失败恢复步数消耗的金币数
    public static Steps_Cost_Gold = 200;

    static BlockScale: number = 0.9;
    static BlockBgScale: number = 0.95;
    static BlockSize: number = 643 / 9;

    static Row: number = 9;
    static Col: number = 9;
}

export enum BlockType {
    INVALID = 0,
    Type1 = 1,//蓝色
    Type2,//黄色
    Type3,//红色
    Type4,//紫色
    End,
};

export enum BlockGridType {
    INVALID = 0,
    Normal = 1,
    Wall = 2,
};

export enum ToolType {
    INVALID = 0,
    Row = 1,
    Col = 2,
    BoomInGrid = 3,
    TypeMatch = 5,
    Hammer = 6,
    Steps = 7,
    Boom = 8,
    Random = 10,
}


