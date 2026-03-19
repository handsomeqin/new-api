package controller

import (
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// GetAgentInfo 获取代理信息
func GetAgentInfo(c *gin.Context) {
	userID, exists := c.Get(string(constant.ContextKeyUserId))
	if !exists {
		c.JSON(401, gin.H{"error": "未授权"})
		return
	}

	user, err := model.GetUserById(userID.(int), false)
	if err != nil {
		c.JSON(500, gin.H{"error": "获取用户信息失败"})
		return
	}

	// 计算升级进度
	upgradeProgress := 0
	switch user.AgentLevel {
	case 0:
		// 普通用户升级到一级代理需要5个一级团队成员
		if user.FirstLevelCount >= 5 {
			upgradeProgress = 100
		} else {
			upgradeProgress = (user.FirstLevelCount * 100) / 5
		}
	case 1:
		// 一级代理升级到二级代理需要团队总人数20人
		totalTeam := user.FirstLevelCount + user.SecondLevelCount + user.ThirdLevelCount
		if totalTeam >= 20 {
			upgradeProgress = 100
		} else {
			upgradeProgress = (totalTeam * 100) / 20
		}
	case 2:
		// 二级代理升级到三级代理需要团队总人数50人
		totalTeam := user.FirstLevelCount + user.SecondLevelCount + user.ThirdLevelCount
		if totalTeam >= 50 {
			upgradeProgress = 100
		} else {
			upgradeProgress = (totalTeam * 100) / 50
		}
	}

	c.JSON(200, gin.H{
		"AgentLevel":      user.AgentLevel,
		"FirstLevelCount": user.FirstLevelCount,
		"SecondLevelCount": user.SecondLevelCount,
		"ThirdLevelCount": user.ThirdLevelCount,
		"FirstLevelQuota": user.FirstLevelQuota,
		"SecondLevelQuota": user.SecondLevelQuota,
		"ThirdLevelQuota": user.ThirdLevelQuota,
		"UpgradeProgress": upgradeProgress,
		"AffCode":         user.AffCode,
	})
}

// GetTeamMembers 获取团队成员
func GetTeamMembers(c *gin.Context) {
	_, exists := c.Get(string(constant.ContextKeyUserId))
	if !exists {
		c.JSON(401, gin.H{"error": "未授权"})
		return
	}

	// 这里需要实现获取团队成员的逻辑
	// 暂时返回空数组，后续需要根据实际情况实现
	c.JSON(200, []gin.H{})
}

// GetAgentRewards 获取代理收益记录
func GetAgentRewards(c *gin.Context) {
	_, exists := c.Get(string(constant.ContextKeyUserId))
	if !exists {
		c.JSON(401, gin.H{"error": "未授权"})
		return
	}

	// 这里需要实现获取代理收益记录的逻辑
	// 暂时返回空数组，后续需要根据实际情况实现
	c.JSON(200, []gin.H{})
}

// GetAgentInviteLink 获取代理邀请链接
func GetAgentInviteLink(c *gin.Context) {
	userID, exists := c.Get(string(constant.ContextKeyUserId))
	if !exists {
		c.JSON(401, gin.H{"error": "未授权"})
		return
	}

	user, err := model.GetUserById(userID.(int), false)
	if err != nil {
		c.JSON(500, gin.H{"error": "获取用户信息失败"})
		return
	}

	inviteLink := "/register?aff=" + user.AffCode
	c.JSON(200, gin.H{
		"inviteLink": inviteLink,
	})
}

// UpgradeAgentLevel 升级代理等级
func UpgradeAgentLevel(c *gin.Context) {
	userID, exists := c.Get(string(constant.ContextKeyUserId))
	if !exists {
		c.JSON(401, gin.H{"error": "未授权"})
		return
	}

	user, err := model.GetUserById(userID.(int), true)
	if err != nil {
		c.JSON(500, gin.H{"error": "获取用户信息失败"})
		return
	}

	// 调用升级代理等级的方法
	err = model.UpdateAgentLevel(user)
	if err != nil {
		c.JSON(500, gin.H{"error": "升级代理等级失败"})
		return
	}

	// 重新获取用户信息
	updatedUser, err := model.GetUserById(userID.(int), false)
	if err != nil {
		c.JSON(500, gin.H{"error": "获取更新后的用户信息失败"})
		return
	}

	c.JSON(200, gin.H{
		"AgentLevel": updatedUser.AgentLevel,
		"message":    "代理等级升级成功",
	})
}