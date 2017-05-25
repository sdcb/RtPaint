using sdmap.Compiler;
using sdmap.Extensions;
using sdmap.Functional;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace RtPaint.Infrastructure
{
    public class EmbeddedResourceSqlEmiter : ISqlEmiter
    {
        private SdmapCompiler _compiler = new SdmapCompiler();

        public string EmitSql(string sqlId, object queryObject)
        {
            return _compiler.Emit(sqlId, queryObject);
        }

        public static EmbeddedResourceSqlEmiter CreateFrom(Assembly assembly)
        {
            var emiter = new EmbeddedResourceSqlEmiter();

            foreach (var name in assembly.GetManifestResourceNames()
                .Where(x => x.EndsWith(".sdmap")))
            {
                using (var reader = new StreamReader(assembly.GetManifestResourceStream(name)))
                {
                    emiter._compiler.AddSourceCode(reader.ReadToEnd());
                }
            }

            return emiter;
        }
    }
}
