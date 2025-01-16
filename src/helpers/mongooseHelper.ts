import mongoose from 'mongoose';

type QueryCondition = Record<string, any>;

export const helperFunction = async (
  modelName: mongoose.Model<any>,
  operation: 'find' | 'findOne' | 'findById' | 'create' | 'updateOne' | 'deleteOne' | 'aggregate',
  condition: QueryCondition = {},
  options: QueryCondition = {}
): Promise<any> => {
  try {
    switch (operation) {
      case 'find':
        return await modelName.find(condition, options.projection, options);
      case 'findOne':
        return await modelName.findOne(condition, options.projection, options);
      case 'findById':
        return await modelName.findById(condition, options.projection, options);
      case 'create':
        return await modelName.create(condition);
      case 'updateOne':
        return await modelName.updateOne(condition.filter, condition.update, options);
      case 'deleteOne':
        return await modelName.deleteOne(condition);
      case 'aggregate':
        return await modelName.aggregate(condition.pipeline);
      default:
        throw new Error('Invalid operation');
    }
  } catch (error) {
    console.error('Error in helperFunction:', error);
    throw error;
  }
};
