import { type CollectionAfterChangeHook } from "payload";
import { type ActivityLogPluginSharedLoggingOptions } from "../types.js";
import { ACTIVITY_LOG_COLLECTION_SLUG } from "../constants.js";

interface Options extends ActivityLogPluginSharedLoggingOptions {
  enableCreateLogging: boolean;
  enableUpdateLogging: boolean;
}

export const afterChangeCollectionActivityLog = (
  options: Options,
): CollectionAfterChangeHook => {
  return async (args) => {
    if (args.req.payloadAPI === "local") {
      return args.doc;
    }

    if (args.operation === "create" && !options.enableCreateLogging) {
      return args.doc;
    }

    if (args.operation === "update" && !options.enableUpdateLogging) {
      return args.doc;
    }

    try {
      await args.req.payload.create({
        collection: ACTIVITY_LOG_COLLECTION_SLUG,
        data: {
          operation: args.operation,
          user: {
            value: args.req.user?.id,
            relationTo: args.req.user?.collection,
          },
          ipAddress: options.enableIpAddressLogging
            ? args.req.headers.get("x-forwarded-for")
            : undefined,
          deviceInfo: options.enableDeviceInfoLogging
            ? args.req.headers.get("user-agent")
            : undefined,
          locale: args.req.locale,
          resource: args.collection.slug,
          documentId: args.doc.id,
          data: args.doc,
        },
        req: args.req,
      });
    } catch (error) {
      args.req.payload.logger.error(error);
    }

    return args.doc;
  };
};
