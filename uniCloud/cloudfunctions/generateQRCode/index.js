'use strict';
const QRCode = require('qrcode')

exports.main = async (event, context) => {
	const { url } = event
	
	if (!url) {
		return {
			code: 400,
			message: '缺少URL参数'
		}
	}
	
	try {
		// 生成二维码
		const qrcode = await QRCode.toDataURL(url)
		
		// 将base64转换为临时文件
		const base64Data = qrcode.replace(/^data:image\/\w+;base64,/, '')
		const buffer = Buffer.from(base64Data, 'base64')
		
		// 上传到云存储
		const result = await uniCloud.uploadFile({
			cloudPath: `qrcode/${Date.now()}.png`,
			fileContent: buffer
		})
		
		return {
			code: 200,
			message: '生成成功',
			data: {
				qrcode: result.fileID
			}
		}
	} catch (e) {
		return {
			code: 500,
			message: '生成失败'
		}
	}
} 