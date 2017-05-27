using Microsoft.AspNetCore.SignalR;
using RtPaint.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RtPaint.Hubs
{
    public class PaintHub : Hub
    {
        public async Task Join(int paintId)
        {
            await Groups.Add(Context.ConnectionId, GroupName(paintId));
        }

        public void Start(int paintId, float x, float y)
        {
            OtherClientsInGroup(paintId).start(x, y);
        }

        public void MoveTo(int paintId, float x, float y)
        {
            OtherClientsInGroup(paintId).moveTo(x, y);
        }

        public void End(int paintId, float? x, float? y)
        {
            OtherClientsInGroup(paintId).end(x, y);
        }

        public void Forward(int paintId)
        {
            OtherClientsInGroup(paintId).forward();
        }

        public void Back(int paintId)
        {
            OtherClientsInGroup(paintId).back();
        }

        public void SetColor(int paintId, string color)
        {
            OtherClientsInGroup(paintId).setColor(color);
        }

        public void SetSize(int paintId, float size)
        {
            OtherClientsInGroup(paintId).setSize(size);
        }

        private dynamic OtherClientsInGroup(int paintId)
        {
            return Clients.OthersInGroup(GroupName(paintId));
        }

        private string GroupName(int paintId)
        {
            return $"Paint-{paintId}";
        }
    }
}
