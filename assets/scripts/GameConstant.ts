export class GameConstant {
    static Row: number = 9;
    static Col: number = 9;
}

export const enum BlockType {
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
    Ice_Thin = 2,// 薄冰 消除一次消失 薄冰里的色块可以交换位置
    Ice_Thick = 3,// 厚冰 消除两次消失 不能交换位置
    Box = 4,// 箱子 消除一次消失 不能交换位置
    Stone_Chips = 5,// 石头碎片 消除一次消失 可以交换位置
    Stone = 6,// 石头 占4个格子 消除四次消失 不能交换位置
    Stone_Null = 7,// 石头占位置用，与Stone一起组成四个格子的石头，起点左下为Stone，其他三个格子均为Stone_Null
    End
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

export enum RewardType {
    Gold = 1,
    Hammer = 2,
    Energy = 3,
    Boom = 4,
    Theme_Clips = 5,// 主题碎片//
    Steps = 6,
    Sort = 7,
}

export enum ETargetType {
    Grid = 0,// 格子元素（BlockGridType中除了INVALID,Normal）
    Block// 方块
}
