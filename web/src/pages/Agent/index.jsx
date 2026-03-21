import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Tag, Progress, Space, Tooltip, Divider, Input, Avatar, Badge, Row, Col } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { getAgentInfo, getTeamMembers } from '../../api/agent';
import { showError, showSuccess } from '../../helpers';

const AgentPage = () => {
  const { t } = useTranslation();
  const [agentInfo, setAgentInfo] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const info = await getAgentInfo();
        setAgentInfo(info);
        
        const members = await getTeamMembers();
        setTeamMembers(members);
      } catch (error) {
        showError(t('获取代理信息失败'));
      } finally {
        setLoading(false);
      }
    };

    fetchAgentInfo();
  }, [t]);

  const getAgentLevelText = (level) => {
    switch (level) {
      case 0:
        return t('普通用户');
      case 1:
        return t('一级代理');
      case 2:
        return t('二级代理');
      case 3:
        return t('三级代理');
      default:
        return t('普通用户');
    }
  };

  const getAgentLevelColor = (level) => {
    switch (level) {
      case 0:
        return 'grey';
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'purple';
      default:
        return 'grey';
    }
  };

  const getAgentLevelIcon = (level) => {
    switch (level) {
      case 0:
        return '🌱';
      case 1:
        return '🥉';
      case 2:
        return '🥈';
      case 3:
        return '🥇';
      default:
        return '🌱';
    }
  };

  const generateInviteLink = () => {
    try {
      // 尝试从本地存储获取用户信息
      const userStr = localStorage.getItem('user');
      let affCode = 'guest';
      
      // 首先尝试从agentInfo获取AffCode
      if (agentInfo?.AffCode) {
        affCode = agentInfo.AffCode;
      } 
      // 然后尝试从本地存储获取用户信息
      else if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.aff_code) {
            affCode = user.aff_code;
          } else if (user && user.id) {
            affCode = user.id;
          } else if (user && user.username) {
            affCode = user.username;
          }
        } catch (e) {
          console.error('解析用户信息失败:', e);
        }
      }
      
      // 生成邀请链接，指向注册页面
      return `${window.location.origin}/register?aff=${encodeURIComponent(affCode)}`;
    } catch (e) {
      console.error('生成邀请链接失败:', e);
      return `${window.location.origin}/register?aff=guest`;
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = generateInviteLink();
    
    // 尝试使用现代的clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('无法使用clipboard API:', err);
          // 回退到传统方法
          fallbackCopyTextToClipboard(inviteLink);
        });
    } else {
      // 使用传统方法
      fallbackCopyTextToClipboard(inviteLink);
    }
  };

  // 传统的复制方法作为回退
  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // 确保文本区域不在屏幕上可见
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    // 选择文本并复制
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        showError(t('复制失败，请手动复制'));
      }
    } catch (err) {
      console.error('复制失败:', err);
      showError(t('复制失败，请手动复制'));
    } finally {
      // 清理
      document.body.removeChild(textArea);
    }
  };

  const getUpgradeProgress = () => {
    const currentLevel = agentInfo?.AgentLevel || 0;
    const firstLevelCount = agentInfo?.FirstLevelCount || 0;
    
    switch (currentLevel) {
      case 0:
        return Math.min(100, (firstLevelCount / 5) * 100);
      case 1:
        return Math.min(100, (firstLevelCount / 20) * 100);
      case 2:
        return Math.min(100, (firstLevelCount / 100) * 100);
      default:
        return 100;
    }
  };

  const getNextLevel = () => {
    const currentLevel = agentInfo?.AgentLevel || 0;
    switch (currentLevel) {
      case 0:
        return t('一级代理');
      case 1:
        return t('二级代理');
      case 2:
        return t('三级代理');
      case 3:
        return t('最高级别');
      default:
        return t('一级代理');
    }
  };

  const getNextLevelRequirement = () => {
    const currentLevel = agentInfo?.AgentLevel || 0;
    switch (currentLevel) {
      case 0:
        return t('邀请5个有效用户');
      case 1:
        return t('一级团队达到20人');
      case 2:
        return t('一级团队达到100人');
      case 3:
        return t('已达到最高级别');
      default:
        return t('邀请5个有效用户');
    }
  };

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-content'>
          <div className='loading-spinner'></div>
          <Typography.Text>{t('加载中...')}</Typography.Text>
        </div>
      </div>
    );
  }

  return (
    <div className='agent-page-container'>
      

      {/* 代理概览卡片 */}
      <Card className='agent-overview-card'>
        <Row gutter={24}>
          <Col span={16}>
            <div className='agent-level-section'>
              <div className='agent-level-header'>
                <div className='agent-level-info'>
                  <div className='agent-level-badge'>
                    <Tag color={getAgentLevelColor(agentInfo?.AgentLevel || 0)} size='large'>
                      <span className='agent-level-icon'>{getAgentLevelIcon(agentInfo?.AgentLevel || 0)}</span>
                      {getAgentLevelText(agentInfo?.AgentLevel || 0)}
                    </Tag>
                  </div>
                  <div className='agent-level-stats'>
                    <div className='stat-item'>
                      <Typography.Text type='secondary'>{t('总团队人数')}</Typography.Text>
                      <Typography.Title heading={4}>
                        {(agentInfo?.FirstLevelCount || 0) + (agentInfo?.SecondLevelCount || 0) + (agentInfo?.ThirdLevelCount || 0)}
                      </Typography.Title>
                    </div>
                    <div className='stat-item'>
                      <Typography.Text type='secondary'>{t('累计收益')}</Typography.Text>
                      <Typography.Title heading={4} className='income-text'>
                        ¥{(agentInfo?.TotalIncome || 0).toFixed(2)}
                      </Typography.Title>
                    </div>
                  </div>
                </div>
              </div>

              {/* 升级进度 */}
              <div className='upgrade-progress-section'>
                <div className='upgrade-progress-header'>
                  <Typography.Text strong>{t('升级进度')}</Typography.Text>
                  <Typography.Text type='secondary'>
                    {t('距离成为')} {getNextLevel()}: {getNextLevelRequirement()}
                  </Typography.Text>
                </div>
                <Progress 
                  percent={getUpgradeProgress()} 
                  strokeColor={getAgentLevelColor(agentInfo?.AgentLevel || 0)}
                  showText
                  className='upgrade-progress-bar'
                />
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className='invite-section'>
              <Typography.Title heading={5}>{t('邀请好友')}</Typography.Title>
              <div className='invite-link-container'>
                <Input 
                  value={generateInviteLink()}
                  readOnly
                  className='invite-link-input'
                />
                <Button 
                  onClick={handleCopyInviteLink}
                  theme='solid'
                  className='copy-button'
                >
                  {copySuccess ? t('已复制') : t('复制链接')}
                </Button>
              </div>
              <div className='invite-tips'>
                <Typography.Text type='secondary' className='invite-tip-item'>
                  📱 {t('分享邀请链接给好友')}
                </Typography.Text>
                <Typography.Text type='secondary' className='invite-tip-item'>
                  🎁 {t('好友注册后您获得佣金奖励')}
                </Typography.Text>
                <Typography.Text type='secondary' className='invite-tip-item'>
                  🌟 {t('团队越大，收益越多')}
                </Typography.Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 邀请返佣规则 */}
      <Card className='commission-rules-card'>
        <Typography.Title heading={5}>{t('邀请返佣规则')}</Typography.Title>
        <div className='rules-content'>
          <Typography.Text strong>{t('返佣基数：')}</Typography.Text>
          <Typography.Text>{t('以被邀请用户的实际有效消费金额（用户支付金额 - 退款金额 - 优惠金额）为结算基数；')}</Typography.Text>
          
          <Typography.Text strong className='mt-4'>{t('返佣比例：')}</Typography.Text>
          <Typography.Text>{t('直接邀请：您可获得自己直接邀请用户的有效消费金额 10% 的佣金；')}</Typography.Text>
          <Typography.Text>{t('一级代理返佣：您可获得自己一级代理（直接邀请的用户）邀请用户的有效消费金额 5% 的佣金；')}</Typography.Text>
          <Typography.Text>{t('二级代理返佣：您可获得自己二级代理（一级代理邀请的用户）邀请用户的有效消费金额 3% 的佣金；')}</Typography.Text>
          
          <Typography.Text strong className='mt-4'>{t('结算规则：')}</Typography.Text>
          <Typography.Text>{t('佣金按自然月结算，次月 5 日前发放至您的账户，可提现 / 抵扣消费。')}</Typography.Text>
        </div>
      </Card>

      {/* 团队成员 */}
      <Card className='team-members-card'>
        <div className='card-header'>
          <Typography.Title heading={5}>{t('团队成员')}</Typography.Title>
          <Typography.Text type='secondary'>
            {t('查看您的团队成员列表')}
          </Typography.Text>
        </div>
        <Table
          columns={[
            {
              title: t('用户'),
              dataIndex: 'username',
              render: (username, record) => (
                <div className='user-info'>
                  <Avatar size='small'>{username.charAt(0).toUpperCase()}</Avatar>
                  <Typography.Text>{username}</Typography.Text>
                </div>
              ),
            },
            {
              title: t('注册时间'),
              dataIndex: 'created_at',
            },
            {
              title: t('级别'),
              dataIndex: 'level',
              render: (level) => (
                <Tag color={getAgentLevelColor(level)}>
                  {getAgentLevelText(level)}
                </Tag>
              ),
            },
            {
              title: t('关系'),
              dataIndex: 'relation',
              render: (relation) => {
                switch (relation) {
                  case 1:
                    return <Tag color='blue'>{t('一级')}</Tag>;
                  case 2:
                    return <Tag color='green'>{t('二级')}</Tag>;
                  case 3:
                    return <Tag color='purple'>{t('三级')}</Tag>;
                  default:
                    return <Tag color='grey'>{t('未知')}</Tag>;
                }
              },
            },
            {
              title: t('贡献'),
              dataIndex: 'contribution',
              render: (contribution) => (
                <Typography.Text strong className='contribution-text'>
                  ¥{contribution || 0}
                </Typography.Text>
              ),
            },
          ]}
          dataSource={teamMembers}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* 代理指南 */}
      <Card className='agent-guide-card'>
        <Typography.Title heading={5}>{t('代理指南')}</Typography.Title>
        <div className='guide-steps'>
          <div className='guide-step'>
            <div className='step-number'>1</div>
            <div className='step-content'>
              <Typography.Text strong>{t('获取邀请链接')}</Typography.Text>
              <Typography.Text type='secondary'>
                {t('在上方复制您的专属邀请链接')}
              </Typography.Text>
            </div>
          </div>
          <div className='guide-step'>
            <div className='step-number'>2</div>
            <div className='step-content'>
              <Typography.Text strong>{t('分享给好友')}</Typography.Text>
              <Typography.Text type='secondary'>
                {t('通过微信、QQ、社交媒体等渠道分享')}
              </Typography.Text>
            </div>
          </div>
          <div className='guide-step'>
            <div className='step-number'>3</div>
            <div className='step-content'>
              <Typography.Text strong>{t('好友注册')}</Typography.Text>
              <Typography.Text type='secondary'>
                {t('好友通过您的链接注册账号')}
              </Typography.Text>
            </div>
          </div>
          <div className='guide-step'>
            <div className='step-number'>4</div>
            <div className='step-content'>
              <Typography.Text strong>{t('获得佣金')}</Typography.Text>
              <Typography.Text type='secondary'>
                {t('好友充值或消费时，您获得相应佣金')}
              </Typography.Text>
            </div>
          </div>
        </div>
      </Card>

      <style jsx>{`
        .agent-page-container {
          padding: 24px;
          min-height: 100vh;
          background-color: var(--semi-color-bg-0);
        }

        .page-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .page-title {
          margin-bottom: 8px;
          background: linear-gradient(135deg, #409EFF, #67C23A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .agent-overview-card {
          margin-bottom: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
        }

        .agent-level-section {
          padding: 16px 0;
        }

        .agent-level-header {
          margin-bottom: 24px;
        }

        .agent-level-info {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .agent-level-badge {
          display: flex;
          align-items: center;
        }

        .agent-level-icon {
          margin-right: 8px;
          font-size: 20px;
        }

        .agent-level-stats {
          display: flex;
          gap: 48px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .income-text {
          color: #67C23A;
        }

        .upgrade-progress-section {
          margin-top: 24px;
        }

        .upgrade-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .upgrade-progress-bar {
          height: 10px;
          border-radius: 5px;
        }

        .invite-section {
          padding: 16px 0;
        }

        .invite-link-container {
          display: flex;
          gap: 12px;
          margin: 16px 0;
        }

        .invite-link-input {
          flex: 1;
        }

        .invite-tips {
          margin-top: 16px;
        }

        .invite-tip-item {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }

        .commission-rules-card {
          margin-bottom: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
        }

        .rules-content {
          margin-top: 16px;
        }

        .mt-4 {
          margin-top: 16px;
        }

        .team-members-card {
          margin-bottom: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
        }

        .card-header {
          margin-bottom: 16px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contribution-text {
          color: #67C23A;
        }

        .agent-guide-card {
          margin-bottom: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
        }

        .guide-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-top: 16px;
        }

        .guide-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--semi-color-primary);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 600px;
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: var(--semi-color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .agent-level-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .agent-level-stats {
            gap: 24px;
          }

          .invite-link-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentPage;