'use strict';

const { OPENID } = require('wx-common');
const db = uniCloud.database();
const usersCollection = db.collection('users');

exports.main = async (event, context) => {
	try {
		// 获取用户openid
		const openid = await OPENID(context);
		if (!openid) {
			return {
				code: -1,
				msg: '获取用户openid失败'
			};
		}

		// 检查参数
		const { userInfo } = event;
		if (!userInfo) {
			return {
				code: -1,
				msg: '缺少用户信息'
			};
		}

		// 检查用户是否已存在
		const user = await usersCollection.where({
			openid
		}).get();

		let result;
		if (user.data.length === 0) {
			// 创建新用户
			result = await usersCollection.add({
				openid,
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl,
				gender: userInfo.gender || 0,
				createTime: Date.now(),
				updateTime: Date.now()
			});
		} else {
			// 更新用户信息
			result = await usersCollection.doc(user.data[0]._id).update({
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl,
				gender: userInfo.gender || 0,
				updateTime: Date.now()
			});
		}

		return {
			code: 0,
			msg: '登录成功',
			data: {
				openid,
				...userInfo
			}
		};
	} catch (e) {
		return {
			code: -1,
			msg: '登录失败：' + e.message
		};
	}
}; 