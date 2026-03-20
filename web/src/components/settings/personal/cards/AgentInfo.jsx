/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Card, Typography, Progress, Divider, Space } from '@douyinfe/semi-ui';

const AgentInfo = ({ t, userState }) => {
  const user = userState?.user;
  if (!user) return null;

  // 代理级别名称
  const agentLevelNames = {
    0: t('普通用户'),
    1: t('一级代理'),
    2: t('二级代理'),
    3: t('三级代理'),
  };

  // 获取用户代理相关属性，提供默认值
  const agentLevel = user.agent_level || 0;
  const firstLevelCount = user.first_level_count || 0;
  const secondLevelCount = user.second_level_count || 0;
  const thirdLevelCount = user.third_level_count || 0;
  const firstLevelQuota = user.first_level_quota || 0;
  const secondLevelQuota = user.second_level_quota || 0;
  const thirdLevelQuota = user.third_level_quota || 0;

  // 计算团队总人数
  const totalTeamMembers = firstLevelCount + secondLevelCount + thirdLevelCount;

  // 计算团队总贡献
  const totalTeamQuota = firstLevelQuota + secondLevelQuota + thirdLevelQuota;

  // 代理级别升级条件
  const levelConditions = {
    1: 5,  // 一级代理需要5个一级团队成员
    2: 20, // 二级代理需要20个一级团队成员
    3: 100, // 三级代理需要100个一级团队成员
  };

  // 计算当前级别升级进度
  const getUpgradeProgress = (currentLevel) => {
    if (currentLevel >= 3) return 100;
    const nextLevel = currentLevel + 1;
    const required = levelConditions[nextLevel];
    const current = firstLevelCount;
    return Math.min((current / required) * 100, 100);
  };

  // 获取下一级别名称
  const getNextLevelName = (currentLevel) => {
    if (currentLevel >= 3) return t('已达到最高级别');
    return agentLevelNames[currentLevel + 1];
  };

  // 获取下一级别所需条件
  const getNextLevelCondition = (currentLevel) => {
    if (currentLevel >= 3) return '';
    const nextLevel = currentLevel + 1;
    const required = levelConditions[nextLevel];
    return t('需要{{count}}个一级团队成员', { count: required });
  };

  return (
    <Card title={t('代理信息')} className="mb-6">
      <div className="space-y-4">
        {/* 代理级别 */}
        <div>
          <Typography.Text strong>{t('当前级别')}</Typography.Text>
          <div className="mt-2 flex items-center gap-2">
            <Typography.Text className="text-lg font-semibold">
              {agentLevelNames[agentLevel] || t('普通用户')}
            </Typography.Text>
            <Typography.Text type="secondary">
              Lv.{agentLevel}
            </Typography.Text>
          </div>
        </div>

        {/* 升级进度 */}
        <div>
          <Typography.Text strong>{t('升级进度')}</Typography.Text>
          <Progress
            percent={getUpgradeProgress(agentLevel)}
            showInfo={false}
            className="mt-2"
          />
          <div className="mt-1 flex justify-between text-sm text-gray-500">
            <span>{t('当前: {{count}}个一级团队成员', { count: firstLevelCount })}</span>
            <span>{getNextLevelCondition(agentLevel)}</span>
          </div>
          <Typography.Text type="secondary" className="mt-1 block">
            {t('下一等级: {{level}}', { level: getNextLevelName(agentLevel) })}
          </Typography.Text>
        </div>

        <Divider />

        {/* 团队信息 */}
        <div>
          <Typography.Text strong>{t('团队信息')}</Typography.Text>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <Typography.Text type="secondary" className="block">{t('一级团队')}</Typography.Text>
              <Typography.Text className="text-xl font-semibold">{firstLevelCount}</Typography.Text>
              <Typography.Text type="secondary" className="block text-sm">
                {t('贡献: {{quota}}', { quota: firstLevelQuota })}
              </Typography.Text>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <Typography.Text type="secondary" className="block">{t('二级团队')}</Typography.Text>
              <Typography.Text className="text-xl font-semibold">{secondLevelCount}</Typography.Text>
              <Typography.Text type="secondary" className="block text-sm">
                {t('贡献: {{quota}}', { quota: secondLevelQuota })}
              </Typography.Text>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <Typography.Text type="secondary" className="block">{t('三级团队')}</Typography.Text>
              <Typography.Text className="text-xl font-semibold">{thirdLevelCount}</Typography.Text>
              <Typography.Text type="secondary" className="block text-sm">
                {t('贡献: {{quota}}', { quota: thirdLevelQuota })}
              </Typography.Text>
            </div>
          </div>
        </div>

        <Divider />

        {/* 团队总览 */}
        <div>
          <Typography.Text strong>{t('团队总览')}</Typography.Text>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <Typography.Text type="secondary" className="block">{t('团队总人数')}</Typography.Text>
              <Typography.Text className="text-xl font-semibold">{totalTeamMembers}</Typography.Text>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <Typography.Text type="secondary" className="block">{t('团队总贡献')}</Typography.Text>
              <Typography.Text className="text-xl font-semibold">{totalTeamQuota}</Typography.Text>
            </div>
          </div>
        </div>

        <Divider />

        {/* 代理规则 */}
        <div>
          <Typography.Text strong>{t('代理规则')}</Typography.Text>
          <ul className="mt-2 list-disc list-inside text-sm space-y-1">
            <li>{t('一级代理: 直推5人，享受直推用户消费10%的奖励')}</li>
            <li>{t('二级代理: 直推20人，享受直推用户消费10%、二级用户消费5%的奖励')}</li>
            <li>{t('三级代理: 直推100人，享受直推用户消费10%、二级用户消费5%、三级用户消费2%的奖励')}</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default AgentInfo;