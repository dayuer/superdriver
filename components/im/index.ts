/**
 * IM 模块导出
 * 
 * 微信风格的聊天系统，包含：
 * - IMScreen: 主入口（包含消息列表、通讯录、Tab 切换）
 * - IMChatList: 会话列表
 * - IMChatRoom: 聊天室（支持群聊/私聊）
 * - IMContacts: 通讯录
 * - IMSessionSettings: 会话设置
 */

export { IMScreen } from './IMScreen';
export { IMChatList, type IMSession } from './IMChatList';
export { IMChatRoom } from './IMChatRoom';
export { IMContacts } from './IMContacts';
export { IMSessionSettings } from './IMSessionSettings';
