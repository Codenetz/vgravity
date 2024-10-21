1. AWS services usage
2. CloudFlare usage
3. Build and deploy
4. Lambda function usage and deployment

Build:
```bash
$ npm run watch
```

Video conversion:
```bash
$ ffmpeg -i header_video_loop_30fr.mp4 -c:v libvpx-vp9 -crf 28 -b:v 0 -b:a 128k -c:a libopus header_video_loop_30fr_crf_28.webm
```

Picture conversion:
```bash
$ ffmpeg -i video_frame.jpg -qscale:v 4 video_frame_4.jpg
```