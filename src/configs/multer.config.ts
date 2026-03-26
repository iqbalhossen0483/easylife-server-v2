import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';

const uploadDir = join(process.cwd(), 'public');

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: uploadDir,
    filename: (_req, file, callback) => {
      const uniqueName = `${uuid()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException('Only JPG, JPEG, PNG files are allowed'),
        false,
      );
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2MB
  },
};

export const multiFileMulterConfig: MulterOptions = {
  ...multerConfig,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
    files: 10,
  },
};
