import { TelemetrySink, DataField, FilledTelemetryEvent, User, App, Session } from "@microsoft/oteljs";
import { OneDSSink, OneDSEndpoint } from '@microsoft/oteljs-1ds';

export class TelemetrySinkProvider {

    private sink: TelemetrySink;

    // This is the callback that the Floodgate SDK will call to get the TelemetrySink.
    public getTelemetrySink(): TelemetrySink {

        if (!this.sink) {
            // this.sink = this.createSink(); // Note to partners: Use this as the reference for your implementation.
            this.sink = this.createMockConsoleSink(); // Note to partners: ignore this mock sink, it's only for testing this sample app.
        }

        return this.sink;
    }

    // daespino note: Create an Otel TelemetrySink to pass it to the FG SDK so it can be attached to the SDK's internal logger.
    // Reference this wiki page for OneDSSink creation, the TelemetryLogger is not needed because FG SDK implements it internally:  https://www.owiki.ms/wiki/Telemetry/OTelJS#1DS_sink
    private createSink(isEUDBUser: boolean = false): TelemetrySink {

        // Setting the required persistent data fields. Host sets User, App and Session fields for themselves.
        let persistentDataFields: DataField[] = [
            ...User.getFields({
                // Required if applicable
                primaryIdentityHash: "11111111-2222-2222-2222-333333333333", // should be a real GUID or identifier
                primaryIdentitySpace: 'UserObjectId', // UserObjectId, MSACID, OrgIdPuid, OrgIdCID, MsaPuid, WopiAuth, or ThirdParty,
                tenantId: "33333333-2222-2222-2222-111111111111", // should be a real GUID
                isAnonymous: false,
            }),
            ...App.getFields({
                name: "Microsoft Fabric",
                platform: "Web",
                version: "42.42.43",
            }),
            ...Session.getFields({
                id: "sampleSessionId",
            }),
        ];

        // For EUDB users, use OneDSEndpoint.EUDB. The host app has the context on which to use and has to set it appropriately.
        const oneDsSink = isEUDBUser ?
            new OneDSSink(persistentDataFields, { endpointUrl: OneDSEndpoint.EUDB } ) :
            new OneDSSink(persistentDataFields, { endpointUrl: OneDSEndpoint.PUBLIC } );

        return oneDsSink;
    }

    private createMockConsoleSink(): TelemetrySink {
        return {
            sendTelemetryEvent:  function sendTelemetryEvent(telemetryEvent: FilledTelemetryEvent, timestamp?: number) {

                const eventId = telemetryEvent.dataFields.find((field) => field.name === 'EventId')?.value;
                const message = telemetryEvent.dataFields.find((field) => field.name === 'Message')?.value;
                const errorMessage = telemetryEvent.dataFields.find((field) => field.name === 'ErrorMessage')?.value;

                const floodgateLogString = `FG LOG: EventId: ${eventId}, Message: ${message}, ErrorMessage: ${errorMessage}`;
                console.log(floodgateLogString);
            },

        };
    }

}