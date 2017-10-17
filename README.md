# ddz_tools
ddz 项目工具集。


## ddz_res_filter
过滤未使用的图片。

## image_scaner
扫描重复的图片。

## trim_ccs
精简 cocos studio ui 工程文件（删除冗余的图片）。

原理:  
1. 拷贝 csd 文件中的所有图片到临时文件夹。  
2. 将临时文件夹覆盖到当前的 images 文件夹。    
3. 根据图片图片文件夹重新生成 csi 文件。   
4. 重新生成 ccs 工程文件。  