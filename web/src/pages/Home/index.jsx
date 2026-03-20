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

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Input,
  ScrollList,
  ScrollItem,
  Card,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
  IconKey,
  IconLink,
  IconGift,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress = statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const [openclawUrl, setOpenclawUrl] = useState('http://ai.bbs5050.com/v1');
  const [generatedKey, setGeneratedKey] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const isChinese = i18n.language.startsWith('zh');

  // 生成随机密钥令牌
  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 生成邀请链接
  const generateInviteLink = () => {
    try {
      // 尝试从本地存储获取用户信息
      const userStr = localStorage.getItem('user');
      let affCode = 'guest';
      
      if (userStr) {
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

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  // 获取用户信息和真实的 API 密钥
  const fetchUserInfo = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          // 获取用户的 API 密钥
          const tokensRes = await API.get('/api/token');
          if (tokensRes.data.success && tokensRes.data.data && tokensRes.data.data.length > 0) {
            // 使用第一个令牌作为默认密钥
            setGeneratedKey(tokensRes.data.data[0].key);
            localStorage.setItem('openclaw_key', tokensRes.data.data[0].key);
          }
          
          // 获取用户的详细信息，确保 aff_code 是最新的
          const userRes = await API.get('/api/user/self');
          if (userRes.data.success && userRes.data.data) {
            const userData = userRes.data.data;
            // 确保邀请链接使用真实的 aff_code
            if (userData.aff_code) {
              setInviteLink(`${window.location.origin}/register?aff=${encodeURIComponent(userData.aff_code)}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  const handleCopyKey = async () => {
    const ok = await copy(generatedKey);
    if (ok) {
      showSuccess(t('已复制密钥到剪切板'));
    }
  };

  const handleCopyInviteLink = async () => {
    const ok = await copy(inviteLink);
    if (ok) {
      showSuccess(t('已复制邀请链接到剪切板'));
    }
  };

  const regenerateKey = () => {
    const newKey = generateRandomKey();
    setGeneratedKey(newKey);
    localStorage.setItem('openclaw_key', newKey);
    showSuccess(t('已生成新密钥'));
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    // 先显示页面，再加载内容
    setHomePageContentLoaded(true);
    
    // 异步加载首页内容
    displayHomePageContent().then();
    
    // 检查用户是否登录，优先获取真实数据
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          // 用户已登录，获取真实数据
          fetchUserInfo().then();
        } else {
          // 用户未登录，使用本地存储或生成随机数据
          const storedKey = localStorage.getItem('openclaw_key');
          if (!storedKey) {
            const newKey = generateRandomKey();
            setGeneratedKey(newKey);
            localStorage.setItem('openclaw_key', newKey);
          } else {
            setGeneratedKey(storedKey);
          }
          
          // 生成邀请链接
          setInviteLink(generateInviteLink());
        }
      } catch (e) {
        console.error('解析用户信息失败:', e);
        // 解析失败，使用本地存储或生成随机数据
        const storedKey = localStorage.getItem('openclaw_key');
        if (!storedKey) {
          const newKey = generateRandomKey();
          setGeneratedKey(newKey);
          localStorage.setItem('openclaw_key', newKey);
        } else {
          setGeneratedKey(storedKey);
        }
        
        // 生成邀请链接
        setInviteLink(generateInviteLink());
      }
    } else {
      // 未登录，使用本地存储或生成随机数据
      const storedKey = localStorage.getItem('openclaw_key');
      if (!storedKey) {
        const newKey = generateRandomKey();
        setGeneratedKey(newKey);
        localStorage.setItem('openclaw_key', newKey);
      } else {
        setGeneratedKey(storedKey);
      }
      
      // 生成邀请链接
      setInviteLink(generateInviteLink());
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className="w-full overflow-x-hidden">
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className="w-full overflow-x-hidden">
          {/* 背景效果 */}
          <div className="bg-effects">
            <div className="grid-lines"></div>
          </div>
          
          <div className="particles" id="particles"></div>

          {/* Hero 部分 */}
          <main className="relative z-10 pt-20 min-h-screen flex flex-col items-center justify-center">
            <div className="hero text-center max-w-4xl px-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-900 leading-tight mb-6">
                云基算力
              </h1>
              <p className="text-lg md:text-xl text-primary mb-4 font-semibold">
                云为基石，算力可信，安心至上
              </p>
              <p className="text-md md:text-lg text-gray-400 mb-8 tracking-wider">
                稳健筑基，数字安心，专业可信赖
              </p>
              
              {/* BASE URL 与端点选择 */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full mt-6 max-w-md mx-auto">
                <Input
                  readonly
                  value={serverAddress}
                  className="flex-1 rounded-full"
                  size={isMobile ? 'default' : 'large'}
                  suffix={
                    <div className="flex items-center gap-2">
                      <ScrollList
                        bodyHeight={32}
                        style={{ border: 'unset', boxShadow: 'unset' }}
                      >
                        <ScrollItem
                          mode="wheel"
                          cycled={true}
                          list={endpointItems}
                          selectedIndex={endpointIndex}
                          onSelect={({ index }) => setEndpointIndex(index)}
                        />
                      </ScrollList>
                      <Button
                        type="primary"
                        onClick={handleCopyBaseURL}
                        icon={<IconCopy />}
                        className="rounded-full"
                      />
                    </div>
                  }
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-row gap-4 justify-center items-center mt-8">
                <Link to="/console">
                  <Button
                    theme="solid"
                    type="primary"
                    size={isMobile ? 'default' : 'large'}
                    className="rounded-3xl px-8 py-2"
                    icon={<IconPlay />}
                  >
                    {t('获取密钥')}
                  </Button>
                </Link>
                {isDemoSiteMode && statusState?.status?.version ? (
                  <Button
                    size={isMobile ? 'default' : 'large'}
                    className="flex items-center rounded-3xl px-6 py-2"
                    icon={<IconGithubLogo />}
                    onClick={() =>
                      window.open(
                        'https://github.com/QuantumNous/new-api',
                        '_blank'
                      )
                    }
                  >
                    {statusState.status.version}
                  </Button>
                ) : (
                  docsLink && (
                    <Button
                      size={isMobile ? 'default' : 'large'}
                      className="flex items-center rounded-3xl px-6 py-2"
                      icon={<IconFile />}
                      onClick={() => window.open(docsLink, '_blank')}
                    >
                      {t('文档')}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* 品牌简介 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-6 text-primary">关于云基算力</h2>
                  <p className="text-lg mb-8">
                    云基算力，是专注数字服务与权益流通的合规服务平台，秉持安全、透明、稳健的运营理念，依托硬核技术实力与专业科研背景，构建高标准、高安全、高公信力的服务体系。平台以基础设施级稳定架构，打造便捷、可靠、放心的使用环境，坚守合规底线，保障用户权益，做全民信赖的数字服务平台。
                  </p>
                </div>
              </Card>
            </div>

            {/* 为什么选择云基算力 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-8 text-primary">为什么选择云基算力？</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🏛️ 科研背书
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>依托浙江大学计算机创新研究院</li>
                        <li>专业团队研发，品质有保障</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🔒 超算级安全
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>对标国家超算安全标准</li>
                        <li>多重加密，保障资产安全</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📜 合规透明
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>坚守合规底线，流程公开透明</li>
                        <li>无隐形消费，放心选购</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🎯 优质Token
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>严格筛选，品质过关</li>
                        <li>稳定可靠，性价比优选</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 限时专属优惠 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls bg-gradient-to-r from-blue-900 to-purple-900">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-6 text-white">限时专属优惠</h2>
                  <p className="text-xl mb-8 text-yellow-300 font-semibold">错过再等一年！手慢无！</p>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-white">活动1：注册送Token</h3>
                      <p className="text-sm text-gray-200">新用户注册即送1000万Token，一周内有效！</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-white">活动2：充值优惠</h3>
                      <p className="text-sm text-gray-200">充的多送的多，换算后比其他平台便宜一半，贵就赔！</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-white">活动3：邀请有礼</h3>
                      <p className="text-sm text-gray-200">邀请好友注册送100万Token，佣金10%！</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-6">活动时间：2026年3月20日 - 2026年5月1日 | 最终解释权归云基算力所有</p>
                </div>
              </Card>
            </div>

            {/* 代理销售 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-8 text-primary">代理销售 · 共赢未来</h2>
                  <p className="text-lg mb-8">零门槛、高佣金、强支持，诚邀各界合作伙伴，携手共创收益</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🚪 零门槛代理
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>无需押金、无需经验</li>
                        <li>个人/企业均可申请，轻松起步</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        💰 高佣金回报
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>佣金比例高达15%-30%</li>
                        <li>销量越高，佣金越高，上不封顶</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🤝 全方位支持
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>提供宣传物料、专属客服</li>
                        <li>实时结算，售后无忧</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <Link to="/console/agent">
                      <Button
                        theme="solid"
                        type="primary"
                        size="large"
                        className="rounded-3xl px-8 py-2"
                      >
                        立即申请代理
                      </Button>
                    </Link>
                    <Link to="/console/agent">
                      <Button
                        theme="borderless"
                        type="primary"
                        size="large"
                        className="rounded-3xl px-8 py-2"
                      >
                        查看代理详情
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>

            {/* 安全保障 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-8 text-primary">安全保障 · 放心托付</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🔐 技术加密
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>银行级加密技术</li>
                        <li>保障交易安全</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📜 合规运营
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>资质齐全，合规备案</li>
                        <li>全程透明可追溯</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        👁️ 实时监控
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>24小时实时监控</li>
                        <li>及时防范风险</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📞 专属客服
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>7×24小时在线</li>
                        <li>及时响应需求</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 优质Token产品 */}
            <div className="products grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-4 mt-20">
              <div className="product-card">
                <span className="product-icon">⭐</span>
                <h3 className="text-22 mb-4">基础版Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  入门优选 · 稳定可靠
                </p>
                <a href="/console" className="btn inline-block mt-4">立即购买</a>
              </div>

              <div className="product-card">
                <span className="product-icon">🌟</span>
                <h3 className="text-22 mb-4">进阶版Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  高性价比 · 权益升级
                </p>
                <a href="/console" className="btn inline-block mt-4">立即购买</a>
              </div>

              <div className="product-card">
                <span className="product-icon">💎</span>
                <h3 className="text-22 mb-4">旗舰版Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  顶级配置 · 专属权益
                </p>
                <a href="/console" className="btn inline-block mt-4">立即购买</a>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link to="/console">
                <Button
                  theme="borderless"
                  type="primary"
                  size="large"
                  className="rounded-3xl px-8 py-2"
                >
                  查看全部产品
                </Button>
              </Link>
            </div>
          </main>
        </div>
      ) :
        <div className="overflow-x-hidden w-full">
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className="w-full h-screen border-none"
            />
          ) : (
            <div
              className="mt-[60px]"
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      }
    </div>
  );
};

export default Home;