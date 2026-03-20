import { API } from '../helpers/api';

// 获取代理信息
export const getAgentInfo = async () => {
  const response = await API.get('/api/agent/info');
  return response.data;
};

// 获取团队成员
export const getTeamMembers = async (params = {}) => {
  const response = await API.get('/api/agent/team', { params });
  return response.data;
};

// 获取代理收益记录
export const getAgentRewards = async (params = {}) => {
  const response = await API.get('/api/agent/rewards', { params });
  return response.data;
};

// 获取代理邀请链接
export const getAgentInviteLink = async () => {
  const response = await API.get('/api/agent/invite-link');
  return response.data;
};

// 升级代理等级
export const upgradeAgentLevel = async () => {
  const response = await API.post('/api/agent/upgrade');
  return response.data;
};

// 获取用户充值记录
export const getUserTopupRecords = async (userId) => {
  const response = await API.get(`/api/agent/topup-records?user_id=${userId}`);
  return response.data;
};