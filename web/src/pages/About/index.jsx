import React from 'react';
import { Card, Typography, Button, Row, Col } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full overflow-x-hidden">
      {/* 背景效果 */}
      <div className="bg-effects">
        <div className="grid-lines"></div>
      </div>
      
      <div className="particles" id="particles"></div>

      {/* Hero 部分 */}
      <main className="relative z-10 pt-20 min-h-screen">
        <div className="hero text-center max-w-4xl mx-auto px-4">
          <Typography.Title heading={1} className="mb-6">
            云基算力
          </Typography.Title>
          <Typography.Text className="text-lg md:text-xl text-primary mb-4 font-semibold">
            云为基石，算力可信，安心至上
          </Typography.Text>
          <Typography.Text className="text-md md:text-lg text-gray-400 mb-8 tracking-wider">
            稳健筑基，数字安心，专业可信赖
          </Typography.Text>
        </div>

        {/* 品牌简介 */}
        <div className="max-w-6xl w-full px-4 mx-auto mt-20">
          <Card className="with-pastel-balls">
            <div className="p-6">
              <Typography.Title heading={2} className="mb-6 text-primary">
                关于云基算力
              </Typography.Title>
              <Typography.Text className="text-lg mb-8">
                云基算力，是专注数字服务与权益流通的合规服务平台，秉持安全、透明、稳健的运营理念，依托硬核技术实力与专业科研背景，构建高标准、高安全、高公信力的服务体系。平台以基础设施级稳定架构，打造便捷、可靠、放心的使用环境，坚守合规底线，保障用户权益，做全民信赖的数字服务平台。
              </Typography.Text>
              <Typography.Text className="text-lg font-semibold mb-4">
                品牌一句话：云基算力，安全稳健，专业可信，数字服务安心之选。
              </Typography.Text>
            </div>
          </Card>
        </div>

        {/* 核心优势 */}
        <div className="max-w-6xl w-full px-4 mx-auto mt-20">
          <Card className="with-pastel-balls">
            <div className="p-6">
              <Typography.Title heading={2} className="mb-8 text-primary">
                核心优势
              </Typography.Title>
              <Row gutter={24}>
                <Col span={12}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      🏛️ 科研背书
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      依托浙江大学计算机创新研究院，专业团队研发，品质有保障
                    </Typography.Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      🔒 超算级安全
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      对标国家超算安全标准，多重加密，保障资产安全
                    </Typography.Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      📜 合规透明
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      坚守合规底线，流程公开透明，无隐形消费，放心选购
                    </Typography.Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      🎯 优质Token
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      严格筛选，品质过关，稳定可靠，性价比优选
                    </Typography.Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </div>

        {/* 安全保障 */}
        <div className="max-w-6xl w-full px-4 mx-auto mt-20">
          <Card className="with-pastel-balls">
            <div className="p-6">
              <Typography.Title heading={2} className="mb-8 text-primary">
                安全保障
              </Typography.Title>
              <Row gutter={24}>
                <Col span={12}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      🔐 技术加密
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      银行级加密技术，保障交易安全
                    </Typography.Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      📜 合规运营
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      资质齐全，合规备案，全程透明可追溯
                    </Typography.Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      👁️ 实时监控
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      24小时实时监控，及时防范风险
                    </Typography.Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      📞 专属客服
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      7×24小时在线，及时响应需求
                    </Typography.Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </div>

        {/* 代理合作 */}
        <div className="max-w-6xl w-full px-4 mx-auto mt-20">
          <Card className="with-pastel-balls">
            <div className="p-6">
              <Typography.Title heading={2} className="mb-8 text-primary">
                代理合作
              </Typography.Title>
              <Typography.Text className="text-lg mb-8">
                零门槛、高佣金、强支持，诚邀各界合作伙伴，携手共创收益
              </Typography.Text>
              <Row gutter={24}>
                <Col span={8}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      🚪 零门槛代理
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      无需押金、无需经验，个人/企业均可申请，轻松起步
                    </Typography.Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      💰 高佣金回报
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      佣金比例高达15%-30%，销量越高，佣金越高，上不封顶
                    </Typography.Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="bg-gray-900 p-6 rounded-lg mb-8">
                    <Typography.Title heading={4} className="mb-4 flex items-center gap-2">
                      🤝 全方位支持
                    </Typography.Title>
                    <Typography.Text className="text-gray-300">
                      提供宣传物料、专属客服，实时结算，售后无忧
                    </Typography.Text>
                  </div>
                </Col>
              </Row>
              <div className="flex justify-center mt-8">
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
              </div>
            </div>
          </Card>
        </div>

        {/* 联系我们 */}
        <div className="max-w-6xl w-full px-4 mx-auto mt-20 mb-20">
          <Card className="with-pastel-balls">
            <div className="p-6">
              <Typography.Title heading={2} className="mb-8 text-primary">
                联系我们
              </Typography.Title>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="text-3xl mb-2">📧</div>
                  <Typography.Title heading={4} className="mb-2">邮箱</Typography.Title>
                  <Typography.Text className="text-gray-300">15824108228@139.com</Typography.Text>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="text-3xl mb-2">📞</div>
                  <Typography.Title heading={4} className="mb-2">电话（微信同号）</Typography.Title>
                  <Typography.Text className="text-gray-300">15824108228</Typography.Text>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="text-3xl mb-2">📍</div>
                  <Typography.Title heading={4} className="mb-2">地址</Typography.Title>
                  <Typography.Text className="text-gray-300">杭州市浙江大学计算机创新研究院</Typography.Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;