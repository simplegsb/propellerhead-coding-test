import { CommonModel, Context, SortOrder } from './models';
import { getAllFindOptions, getFindOptions, toModel } from './util';
import * as sequelize from '../data/sequelize';

interface CommonActions<ModelType extends CommonModel>
{
  /**
   * Retrieves the model for the given ID.
   *
   * @param context The current context.
   * @param id The ID of the model.
   * @param include The related models to include.
   * @returns The model.
   */
  get: (context: Context, id: string, include?: string[]) => Promise<ModelType>;

  /**
   * Retrieves models.
   *
   * @param context The current context.
   * @param page The page to retrieve.
   * @param pageSize The size of the pages (models per page).
   * @param sort The sort order.
   * @param filters The filters.
   * @param query A text-based search query.
   * @param include The related models to include.
   * @returns The models.
   */
  getAll: (context: Context,
           page?: number,
           pageSize?: number,
           sort?: SortOrder[],
           filters?: { [key: string]: string | string[] },
           query?: string,
           include?: string[]) => Promise<ModelType[]>;

  /**
   * Retrieves the number of models that exist.
   *
   * @param context The current context.
   * @param filters The filters.
   * @param query A text-based search query.
   * @returns The number of models that exist.
   */
  count: (context: Context,
          filters?: { [key: string]: string | string[] },
          query?: string) => Promise<number>;

  /**
   * Creates a new model entity based on the given model.
   *
   * @param context The current context.
   * @param model The model to create.
   * @param include The related models to include in the returned model. // TODO remove this?
   * @returns The created evening meeting (with an ID).
   */
  create: (context: Context, model: ModelType, include?: string[]) => Promise<ModelType>;

  /**
   * Updates the given model.
   *
   * @param context The current context.
   * @param model The model to update.
   * @param include The related models to include in the returned model.
   * @returns The updated model.
   */
  update: (context: Context, model: ModelType, include?: string[]) => Promise<ModelType>;

  /**
   * Deletes the model for the given ID.
   *
   * @param context The current context.
   * @param id The ID of the model.
   */
  destroy: (context: Context, id: string) => Promise<void>;
}

export function resolve<ModelType extends CommonModel>(queryAttributes: string[],
                                                       sequelizeModel: sequelize.ModelClass): CommonActions<ModelType>
{
  return {
    get: async (context: Context, id: string, include?: string[]) =>
    {
      const findOptions = getFindOptions(sequelizeModel, include);
      const dataModel = await sequelizeModel.findByPk(id, { ...findOptions, transaction: context.transaction });
      const model = toModel<ModelType>(dataModel);

      return model;
    },
    getAll: async (context: Context,
                   page?: number,
                   pageSize?: number,
                   sort?: SortOrder[],
                   filters?: { [key: string]: string | string[] },
                   query?: string,
                   include?: string[]) =>
    {
      const findOptions = getAllFindOptions(sequelizeModel, page, pageSize, sort, filters, query, queryAttributes, include);
      const dataModels = await sequelizeModel.findAll({ ...findOptions, transaction: context.transaction });
      return dataModels.map(dataModel => toModel(dataModel));
    },
    count: async (context: Context,
                  filters?: { [key: string]: string | string[] },
                  query?: string) =>
    {
      const findOptions = getAllFindOptions(
        sequelizeModel,
        undefined,
        undefined,
        undefined,
        filters,
        query,
        queryAttributes,
        undefined
      );

      return sequelizeModel.count({ ...findOptions, transaction: context.transaction });
    },
    create: async (context: Context, model: ModelType, include?: string[]) =>
    {
      const dataModel = await sequelizeModel.create(model, { transaction: context.transaction });
      return resolve<ModelType>(queryAttributes, sequelizeModel).get(context, dataModel.get('id'), include);
    },
    update: async (context: Context, model: ModelType, include?: string[]) =>
    {
      const dataModel = await sequelizeModel.build(model, { isNewRecord: false });
      await dataModel.save({ transaction: context.transaction });

      return resolve<ModelType>(queryAttributes, sequelizeModel).get(context, dataModel.get('id') as string, include);
    },
    destroy: async (context: Context, id: string) =>
    {
      const dataModel = await sequelizeModel.findByPk(id, { transaction: context.transaction });
      if (!dataModel)
      {
        return;
      }

      await dataModel.destroy({ transaction: context.transaction });
    }
  };
}
